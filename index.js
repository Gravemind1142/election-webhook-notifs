import 'dotenv/config'
import { fetchProgress } from "./lib/fetch-progress.js";
import { loadTimestamp, saveTimestamp } from "./lib/timestamp.js";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function post(payload) {
    try {
        const res = await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!res.ok) throw new Error(`Failed to post: ${res.statusText}\nBody: ${JSON.stringify(payload)}`)
        console.log("Posted update successfully")
        return true;
    } catch (e) {
        console.error(e.message);
        return false;
    }
}

function announceCall(state, winner) {
    const payload = {
        content: `\`@everyone\` AP has called ${state} for ${winner}`
    }
    return post(payload);
}

async function run() {
    const lastRan = loadTimestamp();

    fetchProgress(lastRan).then(async ({ statesProgress, nationalProgress }) => {
        const newStates = statesProgress.filter(v => v.new);

        if (newStates.length === 0) return;

        let success = true;

        if (newStates.length < 4) {
            success = success && (await Promise.all(newStates.map(v => announceCall(v.stateName, v.winner)))).every(result => result === true);
        } else {
            console.log("Too many new calls, skipping...");
        }

        if (nationalProgress.winner) {
            success = success && await announceCall("the US Presidency", nationalProgress.winner)
        }

        const harrisStates = statesProgress.filter(v => v.winner === "Kamala Harris");
        const trumpStates = statesProgress.filter(v => v.winner === "Donald Trump");
        const uncalledStates = statesProgress.filter(v => v.winner === null);

        const payload = {
            content: "US PRESIDENCY OVERVIEW",
            embeds: [{
                title: "US PRESIDENCY OVERVIEW",
                fields: [
                    {
                        name: `:blue_circle: Kamala Harris`,
                        value: harrisStates.map(v => v.statePostal).join(", "),
                    },
                    {
                        name: `:white_circle: Uncalled`,
                        value: uncalledStates.map(v => v.stateName).join(",\n"),
                    },
                    {
                        name: `:red_circle: Trump`,
                        value: trumpStates.map(v => v.statePostal).join(", "),
                    },
                ]
            }]
        }

        success = success && await post(payload);

        if (success) {
            saveTimestamp();
        }
    });
}

run();
setInterval(run, 60000);
