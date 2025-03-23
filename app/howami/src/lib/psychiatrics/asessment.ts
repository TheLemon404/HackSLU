import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GEMENI_API_KEY } from "$env/static/private";

const genAI = new GoogleGenerativeAI(GOOGLE_GEMENI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const Q: Array<string> = [
    "Anything bothering you in particular",
    "You are overall healthy",
    "You are overall happy",
]

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

const RMS: Array<string> = [
    "Have there been at least 6 different periods of time (at least 2 weeks) when you felt deeply depressed?",
    "Did you have problems with depression before the age of 18?",
    "Have you ever had to stop or change your antidepressant because it made you highly irritable or hyper?",
    "Have you ever had a period of at least 1 week during which you were more talkative than normal with thoughts racing in your head?",
    "Have you ever had a period of at least 1 week during which you felt any of the following: unusually happy; unusually outgoing; or unusually energetic?",
    "Have you ever had a period of at least 1 week during which you needed much less sleep than usual?"
]

async function getAIResponse(questions: Array<string>): JsonObject
{
    const prompt = `convert the following list of statements 
    into a list of questions that can be asked 
    to a person to assess their depression level, in a manner that feels conversational, 
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
            "result": "normal"
        }
        Under no circumstances can you return anything other than this json response, including explanations.
        Here is the text data to analize: ${text}
    `
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const json_text = response.text().replace("```json", "").replace("```", "");
    console.log(json_text)
    return JSON.parse(json_text)
}

export function getQuestionListBasedOnSentiment(sentiment: string): Array<string>
{
    switch(sentiment)
    {
        case "normal":
            return Q;
        case "depressed":
            return PHQ_9;
        case "anxiety":
            return GAD_7;
        case "suicidal":
            return ASQ;
        case "bipolar":
            return RMS;
        case "stress":
            return GAD_7;
        case "personality disorder":
            return RMS;
        default:
            return Q
    }
}

export async function formatQuestionAsResponse(question: string, user_text: string): JsonObject
{
    if(question == undefined)
    {
        return undefined;
    }
    
    const prompt = `
    Alter the following question slightly, to make it fit into a conversation with the previous text. 
    Make sure the question is still asked, semi-directly
    Here is the question to format: ${question} and here is the previous
    text: ${user_text}.
    Return your answer in the following json response:
    {
        "response":"..."
    }
    Under no circumstances can you return anything other than this json response, including explanations.
    `

    console.log(prompt)

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const json_text = response.text().replace("```json", "").replace("```", "")
    console.log(json_text);
    return JSON.parse(json_text).response;
}

export async function rejudgeSentiment(text: string, question: string): JsonObject
{
    const prompt = `
    Read the following text data and determine the sentiment of the text, given the previous question.
        I need you to select ONE one of the following (normal, depressed, suicidal, anxiety, bipolar, stress, or personality disorder)
        as a categorization of the following text.
        Return this analysis in json format, here is an example: {
            "result": "normal"
        }
        Under no circumstances can you return anything other than this json response, including explanations.
        Here is the text data to analize: ${text},
        Here is the previous question: ${question}
        `

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const json_text = response.text().replace("```json", "").replace("```", "");
        return JSON.parse(json_text);
}

export async function scorePatient(q_and_a: JsonObject): JsonObject
{
    const prompt = `
    You are going to be provided a list of questions and answers in json format.
    Read these questions and answers, and rate the patients 
    depression, suicidal, anxiety, bipolar, stress, and personality disorder levels.
    Also add an antry for a possible diagnosis, that is either depression, suicidal, anxiety, bipolar, stress, or personality disorder.
    Also add a short explanation for each diagnosis.
    Rate them in a percentage, from 0 - 100, and return your answer in the following json format:
    {
        "depression": 0,
        "suicidal": 0,
        "anxiety": 0,
        "bipolar": 0,
        "stress": 0,
        "personality_disorder": 0,
        "diagnosis": "",
        "explanation": ""
    }
    Under no circumstances can you return anything other than this json response, including explanations.
    Here is the list of questions and answers: ${JSON.stringify(q_and_a)}
    `

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const json_text = response.text().replace("```json", "").replace("```", "");
    return JSON.parse(json_text);
}