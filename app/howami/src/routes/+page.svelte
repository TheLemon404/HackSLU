<script lang="ts">
    import "../globals.css"
</script>

<div>
    <div class="conversation_container">
        <input placeholder="whats on your mind?">
    </div>

    <div class="background">
    </div>
</div>

<style>
    input
    {

        height: 25px;
        width: 100% ;
        position: relative;
        top: calc(100% - 30px);
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

    .conversation_container {
        display: flex;
        justify-content: center;
        margin-top: 40vh;
        padding: 20px;
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
</style>