<script lang="ts">
    import { onMount } from 'svelte';
    import { base } from '$app/paths'
</script>;

<div class="watermark">
    <a href="/">
        <img src="{base}/logo_primary.svg" style="fill: var(--primary_color); width: 35px; height: 35px;">
    </a>
    <h3 style="color: var(--discord);">howami.ai</h3>
</div>

<style>
    .watermark {
        position: absolute;
        top: 0;
        left: 0;
        margin: 30px;
        width: 100px;
        height: 100px;
        z-index: 1;

        display: flex;
    }

    img {
        width: 28px;
        height: 28px;
        filter: brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(1834%) hue-rotate(215deg) brightness(97%) contrast(93%);
        transition: all 200ms;
    }

    a
    {
        height: 36px;
        border: 2px solid var(--light);
        border-radius: 5px;
        transition: all 200ms;
    }

    a:hover
    {
        border: 2px solid var(--discord);
    }

    h3
    {
        margin: 15px;
        margin-top: 7px;
    }
</style>