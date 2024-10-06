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

export const getTestData = async (req: Request, res: Response) => {
  const { course_id } = req.params;
  
  try {
      const questionCount = parseInt(req.query.question_count as string) || 10; // Default to 10 if not provided
      const questionBank = await prisma.questionBank.findUnique({
          where: { course_id: Number(course_id) },
          include: {
              Questions: {
                take: questionCount, // Limit the number of questions fetched
                select:{
                  question_id: true,    // Include question_id
                  question: true,       // Include question text
                  options: true,        // Include options
                  isMultipleChoice: true // Include isMultipleChoice
                  // Do not include `answers`
                }
            },
          },
      });

      if (!questionBank) {
          return res.status(404).json({ message: 'Question bank not found.' });
      }
      console.log(questionBank);
      res.status(200).json({questionBank});
  } catch (error) {
      console.error("Error fetching test data: ", error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const verifyAnswers = async (req: Request, res: Response) => {
  try {
      const { enroll_id, test_id, userAnswers } : {enroll_id: number, test_id: string, userAnswers: {
        question_id: number,
        answers: number[]
      }[]} = req.body; // Expecting an object containing test_id and an array of userAnswers

      // Fetch the questions and their correct answers from the database
      const questions = await prisma.questions.findMany({
          where: { test_id },
          select: {
              question_id: true,
              answers: true, // Retrieve correct answers
          },
      });

      // Prepare a map of correct answers for easy lookup
      const correctAnswersMap = new Map<number, number[]>();
      questions.forEach(question => {
          correctAnswersMap.set(question.question_id, question.answers);
      });

      let score = 0;

      // Verify user answers
      userAnswers.forEach(userAnswer => {
          const correctAnswers = correctAnswersMap.get(userAnswer.question_id);
          if (correctAnswers && JSON.stringify(correctAnswers) === JSON.stringify(userAnswer.answers)) {
              score++; // Increment score for correct answer
          }
      });

      // Calculate the percentage or return the raw score
      const totalQuestions = userAnswers.length;  // TODO: Check this out
      const result = {
          score,
          total: totalQuestions,
          percentage: (score / totalQuestions) * 100,
      };

      await prisma.courseEnrollment.update({
        where:{
          enroll_id
        },
        data:{
          test_score:result.percentage
        }
      });

      await prisma.notifications.create({
        data:{
          enroll_id,
          created_date: new Date()
        }
      });

      console.log(result);
      // Return the score to the frontend
      res.status(200).json(result);
  } catch (error) {
      console.error('Error verifying answers: ', error);
      res.status(500).json({ error: 'Error verifying answers' });
  }
};