import express from "express";
import { CreateQuestion, DeleteQuestion, GetQuestions } from "../controllers/Question.js";


const QuestionRoutes = express.Router();

QuestionRoutes.post("/add", CreateQuestion);
QuestionRoutes.delete("/delete/:id?", DeleteQuestion);
// difficulty will be sent in query params
QuestionRoutes.get("/get", GetQuestions);


export default QuestionRoutes;
