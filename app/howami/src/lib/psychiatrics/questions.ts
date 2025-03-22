import { getAnxietyQuestions, getDepressionQuestions } from "./asessment";

export async function getAllQuestions(): JsonObject
{
    const depression_questions = await getDepressionQuestions();
    const anxiety_questions = await getAnxietyQuestions();

    const questions = {
        "depression": depression_questions,
        "anxiety": anxiety_questions
    }

    return questions;
}