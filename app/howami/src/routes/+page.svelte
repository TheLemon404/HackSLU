<script lang="ts">
    import "../globals.css"
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let responses: string[] = $state([]);

    async function submit_text(e: KeyboardEvent)
    {
        if(e.key == "Enter")
        {
            const user_input_field = document.getElementById("user_text");
            let user_text: string = user_input_field.value;

            if(user_text != "")
            {
                const form_data = {
                    user_text: user_text,
                    depression: data.questions.depression.questions,
                    anxiety: data.questions.anxiety.questions,
                }

                const result = await fetch("/api/chat",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "accept":"application/json"
                        },
                        body: JSON.stringify(form_data)
                    }
                ).then((res) => res.json());
                
                user_input_field.value = "";
                responses.push(result.question_to_ask);
            }
        }
    }
</script>

<div style="overflow: hidden;">
    <div class="conversation_container">
        <div class="response_container">
        {#each responses as response}
            <ul class="response_list">
                <li class="response">
                    <h2 class="ai_header">AI</h2>
                    <div class="line"></div>
                    {response.text}
                </li>
            </ul>
        {/each}
        </div>
        {#if responses.length == 0}
            <input id="user_text" class="center_input" onkeypress={submit_text} placeholder="how are you feeling, is there anything on your mind?">
        {/if}
        {#if responses.length > 0}
            <input id="user_text" class="lower_input" onkeypress={submit_text} placeholder="how are you feeling, is there anything on your mind?">
        {/if}
    </div>

    <div class="background">
    </div>
</div>

<style>
    input
    {
        height: 25px;
        width: 100% ;
        position: absolute;
        max-width: 500px;
        padding: 15px;
        font-size: 18px;
        border: 2px solid var(--light_grey);
        border-radius: 15px;
        transition: all 200ms;
    }

    input:focus {
        outline: none;
        border: 2px solid var(--primary_color);
    }

    .response_list
    {
        list-style: none;
        padding: 5px;
        margin: 5px;
    }

    .response_container
    {
        align-items: flex-end, stretch;
        width: 75vw;
        max-width: 700px;
        height: 85vh;
        overflow-x: hidden;
    }

    .response_container::-webkit-scrollbar
    {
        background-color: transparent;
        width: 7px;
    }

    .response_container::-webkit-scrollbar-track
    {
        background-color: transparent;
    }

    .response_container::-webkit-scrollbar-thumb
    {
        background-color: var(--light_grey);
        border-radius: 15px;
    }

    .center_input
    {
        top: calc(50% - 30px);
    }

    .lower_input
    {
        top: calc(80% - 30px);
    }

    .conversation_container {
        display: flex;
        justify-content: center;
        margin-top: 0vh;
        padding: 20px;
        overflow: hidden;
    }

    .line
    {
        border: 1px solid var(--primary_color);
    }

    .background {
        z-index: -1;
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: var(--darkish_light);
    }

    .response
    {
        border-radius: 10px;
        padding: 5px;
        overflow: hidden;
        color: var(--primary_color);
        font-size: 20px;
        line-height: 30px;
        margin: 10px;
    }

    .ai_header
    {
        margin: 5px;
        margin-left: 20px;
        border-radius: 5px;
        width: 50px;
        color: var(--primary_color);
    }

    @keyframes t{
        from {background-size:0 200%}
    }
    @keyframes b{
        50% {background-position:0 -100%,0 0}
    }
</style>