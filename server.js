const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const YT_API_KEY = process.env.YT_API_KEY;

// -----------------------------
// RANDOM SEARCH → VIDEO PICKER
// -----------------------------
async function getRandomVideo() {
    const queries = [
        "minecraft 100 days",
        "fortnite funny moments",
        "speedrun world record",
        "hardcore minecraft survival",
        "roblox gameplay funny",
        "insane gaming challenge"
    ];

    const query = queries[Math.floor(Math.random() * queries.length)];

    const res = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
            params: {
                key: YT_API_KEY,
                part: "snippet",
                q: query,
                type: "video",
                maxResults: 10
            }
        }
    );

    const items = res.data.items;

    if (!items || items.length === 0) {
        throw new Error("No videos found");
    }

    const video = items[Math.floor(Math.random() * items.length)];

    return {
        id: video.id.videoId,
        title: video.snippet.title
    };
}

// -----------------------------
// SIMPLE HINT GENERATOR (NO COMMENTS API)
// -----------------------------
function generateHint(video) {
    const title = video.title.toLowerCase();

    const hints = [
        "this one got crazy fast 💀",
        "people struggled on this one",
        "this was harder than expected"
    ];

    if (title.includes("minecraft")) {
        hints.push(
            "block game chaos incoming",
            "survival in cubes is suffering",
            "minecraft players are built different"
        );
    }

    if (title.includes("fortnite")) {
        hints.push(
            "build fights went insane",
            "someone cranked 90s for survival",
            "fortnite chaos moment"
        );
    }

    if (title.includes("speedrun")) {
        hints.push(
            "milliseconds mattered here",
            "speedrunners are unreal",
            "perfect execution needed"
        );
    }

    return hints[Math.floor(Math.random() * hints.length)];
}

// -----------------------------
// ROUND ROUTE
// -----------------------------
app.get("/round", async (req, res) => {
    try {
        const video = await getRandomVideo();

        res.json({
            comment: generateHint(video),
            answer: video.title
        });

    } catch (err) {
        console.log(err.message);

        res.json({
            comment: "failed to load round 😭",
            answer: "unknown"
        });
    }
});

// -----------------------------
// GUESS ROUTE
// -----------------------------
app.post("/guess", (req, res) => {
    const { guess, answer } = req.body;

    if (!guess || !answer) {
        return res.json({ score: 0 });
    }

    const g = guess.toLowerCase();
    const a = answer.toLowerCase();

    let score = 0;

    if (g === a) {
        score = 100;
    } else if (a.includes(g) || g.includes(a)) {
        score = 60;
    }

    res.json({ score });
});

// -----------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
