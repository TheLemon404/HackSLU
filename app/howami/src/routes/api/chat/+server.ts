import type { RequestEvent } from "@sveltejs/kit";
import { formatQuestionAsResponse, getDepressionQuestions, getInHouseSentiment, getInitialSentiment, getQuestionListBasedOnSentiment, inHouseRejudgeSentiment, rejudgeSentiment } from "$lib/psychiatrics/asessment";

export async function POST(event: RequestEvent): Promise<Response>
{
    const data = await event.request.json();
    let sentiment = data.sentiment;
    let question_chosen = "";
    let question_chosen_pack: Array<string> = data.chosen_questions
    let question_index = data.question_index;
    let ready_for_results: boolean = false;

    if(data.initial_sentiment)
    {
        sentiment = await getInHouseSentiment(data.user_text);
        console.log(sentiment.result);
        question_chosen_pack = getQuestionListBasedOnSentiment(sentiment.result);
    }

    if(data.sentiment.result == "normal")
    {
        sentiment = await inHouseRejudgeSentiment(data.user_text, data.last_question);
        if(sentiment.result != "normal")
        {
            question_index = 0;
        }
        question_chosen_pack = getQuestionListBasedOnSentiment(sentiment.result);
    }

    if(question_chosen_pack.length == 0)
    {
        ready_for_results = true;
    }

    if(question_index >= question_chosen_pack.length)
    {
        ready_for_results = true;
    }

    question_chosen = question_chosen_pack[question_index]
    question_index++;
    
    const question_to_ask = await formatQuestionAsResponse(question_chosen, data.user_text);

    if(question_to_ask == undefined)
    {
        ready_for_results = true;
    }

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