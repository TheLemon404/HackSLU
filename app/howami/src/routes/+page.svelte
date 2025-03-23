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
    input
    {
        height: 25px;
        width: 100% ;
        position: absolute;
        max-width: 500px;
        padding: 15px;
        font-size: 18px;
        border: 1px solid var(--light_grey);
        border-radius: 50px;
        transition: all 200ms;
    }

    input:focus {
        outline: none;
        border: 1px solid var(--primary_color);
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
        top: calc(90% - 30px);
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
        border: 1px solid var(--light_grey);
    }

    .background {
        z-index: -1;
        position: absolute;
        top: 0;
        left: 0;
        width: calc(100vw - 30px);
        height: calc(100vh - 30px);
        background-color: var(--light);
        border: none;
        margin: 15px;
        border-radius: 15px;
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

    .me_header
    {
        margin: 5px;
        border-radius: 5px;
        width: 50px;
        color: var(--light_dark);
    }

    .ai_header
    {
        margin: 5px;
        border-radius: 5px;
        width: 50px;
        color: var(--primary_color);
    }

    .ai_response
    {
        animation: 2s appear;
    }

    @keyframes appear {
        from { color: transparent;}
        to {color: var(--primary_color);}
    }
</style>