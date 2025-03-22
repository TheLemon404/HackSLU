import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GEMENI_API_KEY } from "$env/static/private";

const genAI = new GoogleGenerativeAI(GOOGLE_GEMENI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const PHQ_9: Array<string> = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fast or fluent that you could be reading a book",
    "Thoughts that you would be better off dead or of hurting yourself",
]

const GAD_7: Array<string> = [
   "Feeling nervous, anxious or on edge",
   "Not being able to stop or control worrying",
   "Worrying too much about different things",
   "Trouble relaxing",
   "Being so restless that it is hard to sti still",
   "Becoming easily annoyed or irritable",
   "Feeling afraid as if something awful mught happen" 
]

const ASQ: Array<string> = [
    "In the past few weeks, have you wished you were dead? ",
    "In the past few weeks, have you felt that you or your family would be better off if you were dead?",
    "In the past week, have you been having thoughts about killing yourself?",
    "Have you ever tried to kill yourself?",
    "Are you having thoughts of killing yourself right now?"
]

async function getAIResponse(questions: Array<string>): JsonObject
{
    const prompt = `convert the following list of statements 
    into a list of questions that can be asked 
    to a person to assess their depression level, in a mannar that feels conversational, 
    and format your response into json that can be parsed using JSON.parse(response): ${questions}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text().replace("```json", "").replace("```", ""));
}

export async function getDepressionQuestions(): JsonObject
{
    return await getAIResponse(PHQ_9);;
}

export async function getAnxietyQuestions(): JsonObject
{
    return await getAIResponse(GAD_7);
}