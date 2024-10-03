const express = require('express');
const cors = require('cors');
require('dotenv').config();
import axios from 'axios'
import authRouter from './routes/authRouter'
import userRouter from './routes/userRouter'
import courseRouter from './routes/courseRouter'
import employeeRouter from './routes/employeeRouter'
import { Request, Response } from 'express';

const app = express();

// app.use(cors())
const corsOptions = {
    origin: [`http://localhost:${process.env.CLIENT_PORT}`], // Allow only these origins
};
  
app.use(cors(corsOptions));

app.use(express.json())

app.post('/api/get-pdf', async (req: Request, res: Response) => {
  try {
    const {course_file_url} = req.body;
    // console.log('pdfUrl: ',course_file_url)
    const response = await axios.get(course_file_url, { responseType: 'arraybuffer' });

    
    // Set headers to correctly display the PDF file in the frontend
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="file.pdf"');
    // Log response details
    // console.log("Fetched PDF length: ", response.data.length);
    // console.log("Fetched PDF headers: ", response.headers);
    
    // Send the PDF data as array buffer
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching PDF:', error);
    res.status(500).send('Error fetching PDF');
  }
});


app.use("/api", authRouter);
app.use("/api/users", userRouter);
app.use("/api/employees", employeeRouter);
app.use("/api/courses", courseRouter);

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running on localhost:${process.env.SERVER_PORT}`)
});