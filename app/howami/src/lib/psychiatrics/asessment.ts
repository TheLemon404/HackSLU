import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GEMENI_API_KEY } from "$env/static/private";
import type { JsonOptions } from "vite";

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

export async function getInitialSentiment(text: string): JsonObject
{
    const prompt = `
        Read the following text data and determine the sentiment of the text.
        I need you to select ONE one of the following (normal, depressed, suicidal, anxiety, bipolar, stress, or personality disorder)
        as a categorization of the following text.
        Return this analysis in json format, here is an example: {
            result: "normal"
        }
        Under no circumstances can you return anything other than this json response, including explanations.
        Here is the text data to analize: ${text}
    `
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const json_text = response.text().replace("```json", "").replace("```", "");
    console.log(json_text)
    return JSON.parse(json_text);
}

export function getQuestionListBasedOnSentiment(sentiment: string): List<string>
{
    switch(sentiment)
    {
        case "normal":
            return [];
        case "depressed":
            return PHQ_9;
        case "anxiety":
            return GAD_7;
        default:
            return ["do you love dogs?"] 
    }
}

export async function formatQuestionAsResponse(question: string, user_text: string): JsonObject
{
    const prompt = `
    alter the following question slightly, to make it fit into a conversation with the previous text. 
    Make sure the question is still asked, semi-directly
    Here is the question to format: ${question} and here is the previous
    text: ${user_text}.
    Under no circumstances can you return anything other than this json response, including explanations.
    `

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text().replace("```json", "").replace("```", "")).response;
}

export async function scorePatient()