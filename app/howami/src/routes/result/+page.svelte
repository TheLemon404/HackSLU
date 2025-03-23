<script lang='ts'>
    import { getContext, onMount } from "svelte";
    import "../../globals.css"  
    import Watermark from "$lib/watermark.svelte";

    let latitude;
    let longitude = null;
    let error = null;

    const score = JSON.parse(window.localStorage.getItem("score"));
    let resources: JsonObject = $state({});

    function capitalize(s: string)
    {
        return s && String(s[0]).toUpperCase() + String(s).slice(1);
    }

    onMount(async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position: GeolocationPosition) => 
            {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;

                resources = await fetch("/api/doctors",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "accept":"application/json"
                    },
                    body: JSON.stringify(
                        {
                            location: {
                                latitude: latitude,
                                longitude: longitude
                            },
                            diagnosis: score.diagnosis
                        }
                    )
                }
            ).then((res) => res.json());
            console.log(resources);
            });
        }  
    })
</script>

<div class="container">
    <div class="section">
        <h3>Overview</h3>
        <div class="stats">
            <div class="stat">
                <span class="label">Possible Diagnosis</span>
                <span class="value">{capitalize(score.diagnosis)}</span>
                <span class="value_minor">Explanation: {score.explanation}</span>
            </div>
        </div>
    </div>

    <div class="section">
        <h3>Risk Analysis</h3>
        <div class="metrics">
            <div class="metric">
                <span>Anxiety Level</span>
                <div class="bar">
                    <div class="bar-inner" style="border-radius: 15px; width: {score.anxiety}%; height: 100%; background-color: color-mix(in srgb, var(--good) {100-score.anxiety}%, var(--bad) {score.anxiety}%);"></div>
                </div>
            </div>
            <div class="metric">
                <span>Bipolar Level</span>
                <div class="bar">
                    <div class="bar-inner" style="border-radius: 15px; width: {score.bipolar}%; height: 100%; background-color: color-mix(in srgb, var(--good) {100-score.bipolar}%, var(--bad) {score.bipolar}%);"></div>
                </div>
            </div>
            <div class="metric">
                <span>Depression Risk</span>
                <div class="bar">
                    <div class="bar-inner" style="border-radius: 15px; width: {score.depression}%; height: 100%; background-color: color-mix(in srgb, var(--good) {100-score.depression}%, var(--bad) {score.depression}%);"></div>
                </div>
            </div>
            <div class="metric">
                <span>Personality Disorder Risk</span>
                <div class="bar">
                    <div class="bar-inner" style="border-radius: 15px; width: {score.personality_disorder}%; height: 100%; background-color: color-mix(in srgb, var(--good) {100-score.personality_disorder}%, var(--bad) {score.personality_disorder}%);"></div>
                </div>
            </div>
            <div class="metric">
                <span>Stress Risk</span>
                <div class="bar">
                    <div class="bar-inner" style="border-radius: 15px; width: {score.stress}%; height: 100%; background-color: color-mix(in srgb, var(--good) {100-score.stress}%, var(--bad) {score.stress}%);"></div>
                </div>
            </div>
            <div class="metric">
                <span>Suicidal Risk</span>
                <div class="bar">
                    <div class="bar-inner" style="border-radius: 15px; width: {score.suicidal}%; height: 100%; background-color: color-mix(in srgb, var(--good) {100-score.suicidal}%, var(--bad) {score.suicidal}%);"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <h3>Nearby Resources</h3>
        <div class="recommendation">
            {#if resources.hospitals == undefined}
                <div class="lds-ripple"><div></div></div>
            {/if}
            {#each resources.hospitals as hospital}
                <a class="link" href={hospital.website}>{hospital.name}</a>
                <p>{hospital.speciality}</p>
            {/each}
        </div>
    </div>

    <div class="background"></div>

    <Watermark />
</div>

<style>
    .container {
        font-family: var(--font);
        font-weight: var(--font_weight);
        font-style: var(--font_style);
        width: 90vw;
        margin: 2rem auto;
        padding: 1.5rem;
        background: var(--light);
        border-radius: 12px;
        display: flex;
    }

    .background {
        z-index: -1;
        position: absolute;
        top: 15px;
        left: 15px;
        width: calc(100vw - 30px);
        height: calc(100vh - 30px);
        background: var(--light);
        border-radius: 15px;
    }

    h2 {
        font-family: var(--font);
        font-weight: var(--font_weight);
        font-style: var(--font_style);
        color: var(--primary_color);
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid var(--dark_light);
    }

    .section {
        font-family: var(--font);
        font-weight: var(--font_weight);
        font-style: var(--font_style);
        margin: 1.5rem 0;
        padding: 1rem;
        background: var(--very_light);
        border-radius: 8px;
        width: 30vw;
        margin: 10px;
        margin-top: 5vh;
    }

    h3 {
        font-family: var(--font);
        font-weight: var(--font_weight);
        font-style: var(--font_style);
        color: var(--dark_grey);
        font-size: 1.1rem;
        margin-bottom: 1rem;
    }

    .stats {
        font-family: var(--font);
        font-weight: var(--font_weight);
        font-style: var(--font_style);
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .stat {
        font-family: var(--font);
        font-weight: var(--font_weight);
        font-style: var(--font_style);
        flex: 1;
        min-width: 160px;
        padding: 0.75rem;
        background: var(--light);
        border-radius: 6px;
        border-left: 3px solid var(--primary_color);
    }

    .label {
        font-family: var(--font);
        font-weight: var(--font_weight);
        font-style: var(--font_style);
        display: block;
        color: var(--grey);
        font-size: 0.9rem;
    }

    .value {
        font-family: var(--font);
        font-weight: var(--font_weight);
        font-style: var(--font_style);
        display: block;
        color: var(--dark_grey);
        font-size: 1.1rem;
        font-weight: 600;
        margin-top: 0.25rem;
    }

    .value_minor
    {
        font-family: var(--font);
        font-weight: var(--font_weight);
        font-style: var(--font_style);
        display: block;
        color: var(--dark_grey);
        font-size: 1.1rem;
        font-weight: 400;
        margin-top: 0.25rem;
    }

    .metrics {
        font-family: var(--font);
        font-weight: var(--font_weight);
        font-style: var(--font_style);
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .bar {
        font-family: var(--font);
        font-weight: var(--font_weight);
        font-style: var(--font_style);
        height: 8px;
        background: var(--darkish_light);
        border-radius: 4px;
        margin-top: 0.5rem;
    }

    .recommendation p {
        font-family: var(--font);
        font-weight: var(--font_weight);
        font-style: var(--font_style);
        color: var(--dark_grey);
        margin: 0;
    }

    .recommendation
    {
        display: flex;
        flex-wrap: wrap;
        padding: 5px;
    }

    .link
    {
        font: var(--font);
        font-weight: 500;
        font-style: var(--font_style);
        color: var(--discord);
        text-decoration: none;
        border: 2px solid var(--light);
        background-color: var(--light);
        padding: 5px;
        margin: 5px;
        border-radius: 25px;
    }

        
    .lds-ripple,
    .lds-ripple div {
        box-sizing: border-box;
    }
    .lds-ripple {
        display: inline-block;
        position: relative;
        width: 80px;
        height: 80px;
        margin: auto;
        margin-top: 70px;
    }
    .lds-ripple div {
        position: absolute;
        border: 4px solid var(--discord);
        opacity: 1;
        border-radius: 50%;
        animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    }
    .lds-ripple div:nth-child(2) {
        animation-delay: -0.5s;
    }
    @keyframes lds-ripple {
        0% {
            top: 36px;
            left: 36px;
            width: 8px;
            height: 8px;
            opacity: 0;
        }
        4.9% {
            top: 36px;
            left: 36px;
            width: 8px;
            height: 8px;
            opacity: 0;
        }
        5% {
            top: 36px;
            left: 36px;
            width: 8px;
            height: 8px;
            opacity: 1;
        }
        100% {
            top: 0;
            left: 0;
            width: 80px;
            height: 80px;
            opacity: 0;
        }
    }
</style>