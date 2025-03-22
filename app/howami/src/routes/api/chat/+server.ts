import type { RequestEvent } from "@sveltejs/kit";
import { formatQuestionAsResponse, getDepressionQuestions, getInitialSentiment, getQuestionListBasedOnSentiment } from "$lib/psychiatrics/asessment";

function getRandomArrayElement(array: Array<any>): any
{
    if (!array || array.length === 0)
    {
        return undefined;
    }

    const random_index = Math.floor(Math.random() * array.length);
    return array[random_index]
}

export async function POST(event: RequestEvent): Promise<Response>
{
    const data = await event.request.json();
    let sentiment = {};
    let question_chosen = "";
    let question_chosen_pack: Array<string> = data.chosen_questions
    let question_index = data.question_index;
    let ready_for_results: boolean = false;

    if(data.initial_sentiment)
    {
        sentiment = await getInitialSentiment(data.user_text)
        question_chosen_pack = getQuestionListBasedOnSentiment(sentiment.result);
    }
    
    if(question_chosen_pack.length == 0)
    {
        ready_for_results = true;
    }

    question_chosen = question_chosen_pack[question_index];
    question_index++;

    const question_to_ask = await formatQuestionAsResponse(question_chosen, data.user_text);
    const response = {
        question_to_ask: question_to_ask,
        sentiment: sentiment,
        initial_sentiment: false,
        chosen_questions: question_chosen_pack,
        chosen_question_index: question_index,
        ready_for_results: ready_for_results,
    }
    
    return new Response(JSON.stringify(response), {
        headers:
        {
            "Content-Type": "application/json"
        },
        status: 200
    })
}