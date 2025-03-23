import { scorePatient } from "$lib/psychiatrics/asessment";
import type { RequestEvent } from "@sveltejs/kit";

export async function POST(event: RequestEvent): Promise<Response>
{
    const data = await event.request.json();

    const score = await scorePatient(data);

    return new Response(JSON.stringify(score), {
        headers:
        {
            "Content-Type": "application/json"
        },
        status: 200
    })
}