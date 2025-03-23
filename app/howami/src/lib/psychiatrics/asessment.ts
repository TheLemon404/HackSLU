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
   "Being so restless that it is hard to sit still",
   "Becoming easily annoyed or irritable",
   "Feeling afraid as if something awful mught happen" 
]

// Suicidal
const ASQ: Array<string> = [
    "In the past few weeks, have you wished you were dead? ",
    "In the past few weeks, have you felt that you or your family would be better off if you were dead?",
    "In the past week, have you been having thoughts about killing yourself?",
    "Have you ever tried to kill yourself?",
    "Are you having thoughts of killing yourself right now?"
]

// Bipolar
const RMS: Array<string> = [
    "Have there been at least 6 different periods of time (at least 2 weeks) when you felt deeply depressed?",
    "Did you have problems with depression before the age of 18?",
    "Have you ever had to stop or change your antidepressant because it made you highly irritable or hyper?",
    "Have you ever had a period of at least 1 week during which you were more talkative than normal with thoughts racing in your head?",
    "Have you ever had a period of at least 1 week during which you felt any of the following: unusually happy; unusually outgoing; or unusually energetic?",
    "Have you ever had a period of at least 1 week during which you needed much less sleep than usual?"
]

//Personality Disorder
const McLean: Array<string> = [
    "Have any of your closest relationships been troubled by a lot of arguments or repeated breakups?",
    "Have you deliberately hurt yourself physically (e.g., punched yourself, cut yourself, burned yourself)? How about made a suicide attempt?",
    "Have you had at least two other problems with impulsivity (e.g., eating binges and spending sprees, drinking too much and verbal outbursts)?",
    "Have you been extremely moody?",
    "Have you felt very angry a lot of the time? How about often acted in an angry or sarcastic manner?​",
    "Have you often been distrustful of other people?",
    "Have you frequently felt unreal or as if things around you were unreal?",
    "Have you chronically felt empty?",
    "Have you often felt that you had no idea of who you are or that you have no identity?",
    "Have you made desperate efforts to avoid feeling abandoned or being abandoned (e.g., repeatedly called someone to reassure yourself that he or she still cared, begged them not to leave you, clung to them physically)?"
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

export async function getInHouseSentiment(text: string): JsonObject
{
    const res = await fetch("http://localhost:8000/", 
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accept":"application/json"
        },
        body: JSON.stringify({
            "user_text":text
        })
    }).then((res) => res.json());

	return res;
}

export async function getInitialSentiment(text: string): JsonObject
{
    const prompt = `
        Read the following text data and determine the sentiment of the text.
        I need you to select ONE one of the following category types (normal, depressed, suicidal, anxiety, bipolar, stress, or personality_disorder)
        as a categorization of the following text.
        Return this analysis in json format, here is an example: {
            "result": "..."
        }
        Under no circumstances can you return anything other than this json response, including explanations.
        Here is the text data to analize: ${text}
    `

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const json_text = response.text().replace("```json", "").replace("```", "");

    console.log(json_text);
    return JSON.parse(json_text)
}

export function getQuestionListBasedOnSentiment(sentiment: string): List<string>
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
        case "personality_disorder":
            return McLean;
        default:
            return ["You seem fine in all honesty, is there anything else you want to talk about?"] 
    }
}

export async function formatQuestionAsResponse(question: string, user_text: string): JsonObject
{    
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const json_text = response.text().replace("```json", "").replace("```", "")
    return JSON.parse(json_text).response;
}

export async function inHouseRejudgeSentiment(text: string, question: string): JsonObject
{
    const res = await fetch("http://localhost:8000/", 
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accept":"application/json"
        },
        body: JSON.stringify({
            "user_text":text
        })
    }).then((res) => res.json());

    return res;
}

export async function rejudgeSentiment(text: string, question: string): JsonObject
{
    const prompt = `
    Read the following text data and determine the sentiment of the text, given the previous question.
    I need you to select ONE one of the following (normal, depressed, suicidal, anxiety, bipolar, stress, or personality_disorder)
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
    Also add a short explanation for each diagnosis. Also rank the immediate medical help from 0 to 100, given this context.
    Rate them in a percentage, from 0 - 100, and return your answer in the following json format:
    {
        "depression": 0,
        "suicidal": 0,
        "anxiety": 0,
        "bipolar": 0,
        "stress": 0,
        "personality_disorder": 0,
        "diagnosis": "",
        "explanation": "",
        "need_for_help: 0
    }
    Under no circumstances can you return anything other than this json response, including explanations.
    Here is the list of questions and answers: ${JSON.stringify(q_and_a)}
    `

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const json_text = response.text().replace("```json", "").replace("```", "");
    return JSON.parse(json_text);
}

export async function getDoctorsNearMe(location: JsonObject, diagnosis: string): JsonObject
{
    const prompt = `
    You are going to be provided a location, in latitude and longitude, and a psychiatric diagnosis.
    Return a list of hospitals somewhat near the location that are specialized in the diagnosis.
    Also provide a list of other mental health links, and resources;
    Return your answer in the following json format:
    {
        "hospitals": [
            {
                "name": "",
                "specialty": "",
                "location": "",
                "phone_number": "",
                "website": ""
            }
        ],
        "resources": [
            {
                "title":"",
                "link":""
            }
        ]
    }
    Under no circumstances can you return anything other than this json response, including explanations.
    Here is the location: {longitude: ${location.longitude}, latitude: ${location.latitude}}
    Here is the diagnosis: ${diagnosis}
    `

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const json_text = response.text().replace("```json", "").replace("```", "");    
    return JSON.parse(json_text);
}