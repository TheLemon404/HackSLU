import type { RequestEvent } from "@sveltejs/kit";

export async function POST(event: RequestEvent): Promise<Response>
{
    const data = await event.request.json();

    console.log(data);

    return new Response(JSON.stringify(data), {
        headers:
        {
            "Content-Type": "application/json"
        },
        status: 200
    })
}