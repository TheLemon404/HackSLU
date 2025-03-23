<script lang="ts">
    import "../globals.css"
    import type { PageData } from "./$types";
    import { base } from "$app/paths"
    import gsap from "gsap";
    import { goto } from "$app/navigation";
    import { setContext } from "svelte";

    let { data }: { data: PageData } = $props();

    let responses: string[] = $state([]);
    let initial_sentiment: boolean = true;
    let question_index = 0;
    let sentiment = {};

    let answers: Array<string> = [];
    let questions: Array<string> = [];

    async function submit_text(e: KeyboardEvent)
    {
        if(e.key == "Enter")
        {
            const user_input_field = document.getElementById("user_text");
            const scroll_panel = document.getElementById("response_container");
            let user_text: string = user_input_field.value;
            user_input_field.value = "";

            if(user_text != "")
            {
                responses.push({
                    id: -1,
                    text: user_text
                });

                const form_data = {
                    sentiment: sentiment,
                    last_question: data.questions[question_index],
                    initial_sentiment: initial_sentiment,
                    user_text: user_text,
                    chosen_questions: data.questions,
                    question_index: question_index
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

                question_index = result.chosen_question_index
                data.questions = result.chosen_questions;
                
                responses.push({
                    id: 1,
                    text: result.question_to_ask
                });

                initial_sentiment = result.initial_sentiment;

                sentiment = result.sentiment;

                questions.push(result.question_to_ask);

                answers.push(user_text);

                if(result.ready_for_results)
                {
                    answers.splice(0,1);

                    let q_and_a: Array<JsonObject> = [];
                    for(let i = 0; i < answers.length; i++)
                    {
                        q_and_a.push({
                            question: questions[i],
                            answer: answers[i]
                        });
                    }

                    const score = await fetch("/api/score",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "accept":"application/json"
                            },
                            body: JSON.stringify(q_and_a)
                        }
                    ).then((res) => res.json());

                    window.localStorage.setItem("score", JSON.stringify(score));
                    goto('/result');
                }


                gsap.to(scroll_panel, {
                    duration: 1,
                    scrollTop: scroll_panel.scrollHeight,
                    ease: "bezier"
                });
            }
        }
    }
</script>

<div style="overflow: hidden;">
    <div class="conversation_container">
        <div id="response_container" class="response_container">
        {#each responses as response}
            <ul class="response_list">
                <li class="response">
                    {#if response.id == -1}
                    <h2 class="me_header"></h2>
                    <div class="line"></div>
                    <p style="color: var(--dark);">{response.text}</p>
                    {:else}
                    <h2 class="ai_header">
                        <img src="{base}/logo_primary.svg" style="fill: var(--primary_color); width: 35px; height: 35px;">
                    </h2>
                    <div class="line"></div>
                    <p class="ai_response">{response.text}</p>
                    {/if}
                </li>
            </ul>
        {/each}
        </div>
        {#if responses.length == 0}
            <input autocomplete="off" id="user_text" class="center_input" onkeypress={submit_text} placeholder="how are you feeling, is there anything on your mind?">
        {/if}
        {#if responses.length > 0}
            <input autocomplete="off" id="user_text" class="lower_input" onkeypress={submit_text} placeholder="how are you feeling, is there anything on your mind?">
        {/if}
    </div>

    <div class="background">
    </div>
</div>

<style>
    .ai_header {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
    }

    .ai_header img {
        width: 28px;
        height: 28px;
        filter: brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(1834%) hue-rotate(215deg) brightness(97%) contrast(93%);
    }

    .me_header {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--darkish_light);
        width: 40px;
        height: 40px;
        border-radius: 8px;
    }

    .me_header svg {
        width: 24px;
        height: 24px;
        color: var(--dark);
    }

    .conversation_container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        padding: 20px;
    }

    .response_container {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
    }

    .response {
        display: flex;
        gap: 15px;
        margin: 15px 0;
    }

    .response:has(.me_header) {
        margin-left: auto;
    }

    .response_list {
        padding: 0;
        margin: 0;
    }

    .ai_response {
        background: var(--very_light);
        padding: 12px 20px;
        border-radius: 12px;
        color: var(--dark);
        border: 1px solid var(--light_grey);
        max-width: 80%;
    }

    .response:has(.me_header) p {
        background: var(--discord);
        color: var(--very_light);
        border-radius: 12px;
        padding: 12px 20px;
    }

    input {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 600px;
        padding: 12px 20px;
        border: 1px solid var(--light_grey);
        border-radius: 24px;
        background: var(--very_light);
        color: var(--dark);
    }

    input:focus {
        outline: none;
        border-color: var(--primary_color);
    }

    .background {
        background: var(--light);
    }

    .response_container::-webkit-scrollbar {
        width: 6px;
    }

    .response_container::-webkit-scrollbar-thumb {
        background: var(--light_grey);
    }
</style>