import { getDoctorsNearMe } from "$lib/psychiatrics/asessment";
import type { RequestEvent } from "@sveltejs/kit";

export async function POST(event: RequestEvent): Promise<Response>
{
    const data = await event.request.json();

    const resources = await getDoctorsNearMe(data.location, data.diagnosis);

    return new Response(JSON.stringify(resources), {
        headers:
        {
            "Content-Type": "application/json"
        },
        status: 200
    })
}