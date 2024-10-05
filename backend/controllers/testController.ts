import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { JwtPayloadType } from '../utils/jwtHelper';

interface CustomRequest extends Request {
  user?: JwtPayloadType;
}
// Get all employees
export const getCoursesQuestionDetails = async (req: CustomRequest, res: Response) => {
  try {
    const courseQuestions = await prisma.course.findMany({
        select: {
          course_id: true,
          course_name: true,
          difficulty_level: true,
          QuestionBank: {
            select: {
              test_id: true,
              time_per_question_in_sec: true,
              Questions: {
                select: {
                  question_id: true,
                  question: true,
                  options: true,
                  isMultipleChoice: true,
                  answers: true,
                },
              },
            },
          },
        },
      });  
    console.log(courseQuestions);
    res.status(200).json({courseQuestions});
  } catch (error) {
      console.log("Error at getCoursesQuestionDetails: ", error);
    res.status(500).json({ error: 'Error fetching courseQuestions' });
  }
};

export const updateTest = async (req: CustomRequest, res: Response) => {
    try {
        const { 
            course_id, 
            questions, 
            time_per_question_in_sec 
        } = req.body;

        // Check if required fields are present
        if (!course_id || !questions || !time_per_question_in_sec) {
            return res.status(400).json({ error: 'Missing required fields: course_id, questions, or time_per_question_in_sec' });
        }

        // Find the QuestionBank by course_id
        let questionBank = await prisma.questionBank.findUnique({
            where: { course_id }
        });

        // If not found, create a new QuestionBank
        if (!questionBank) {
            questionBank = await prisma.questionBank.create({
                data: {
                    course_id,
                    time_per_question_in_sec
                }
            });
        } 
        const test_id = questionBank.test_id;
        // Remove all existing questions associated with this test_id
        await prisma.questions.deleteMany({
            where: { test_id }
        });

        // Create new questions
        const newQuestions = await prisma.questions.createMany({
            data: questions.map((q: any, index: number) => ({
                question_id: index+1,
                question: q.question,
                options: q.options,
                isMultipleChoice: q.isMultipleChoice,
                answers: q.answers,
                test_id // associate new questions with the test_id
            })),
        });
        
        res.status(200).json({ questionBank });
    } catch (error) {
        console.error("Error at updateTest: ", error);
        res.status(500).json({ error: 'Error updating or creating the test' });
    }
};