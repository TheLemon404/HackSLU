<script lang="ts">
    import "../globals.css"

    async function submit_text(e: KeyboardEvent)
    {
        if(e.key == "Enter")
        {
            let user_text: string = document.getElementById("user_text")?.value;
            if(user_text != "")
            {
                const data = {
                    user_text: user_text
                }

                const result = await fetch("/api/chat",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "accept":"application/json"
                        },
                        body: JSON.stringify(data)
                    }
                ).then((res) => res.json())
                
                console.log(result);
            }
        }
    }
</script>

<div>
    <div class="conversation_container">
        <input id="user_text" onkeypress={submit_text} placeholder="whats on your mind?">
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