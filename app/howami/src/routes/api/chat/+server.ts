import type { RequestEvent } from "@sveltejs/kit";
import { getDepressionQuestions } from "$lib/psychiatrics/asessment";

function getRandomArrayElement(array: Array<any>): any
{
    if (array.length === 0)
    {
        return undefined;
    }

    const random_index = Math.floor(Math.random() * array.length);
    return array[random_index]
}

export async function POST(event: RequestEvent): Promise<Response>
{
    const data = await event.request.json();

    const response = {
        question_to_ask: getRandomArrayElement(data.depression),
    }
    
    return new Response(JSON.stringify(response), {
        headers:
        {
            "Content-Type": "application/json"
        },
        status: 200
    })
}