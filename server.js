const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const YT_API_KEY = process.env.YT_API_KEY;

// -----------------------------
// GET RANDOM VIDEO FROM YOUTUBE
// -----------------------------
async function getRandomVideo() {
    const queries = [
        "minecraft 100 days",
        "fortnite funny moments",
        "survival challenge",
        "speedrun world record",
        "hardcore minecraft"
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
// GET REAL YOUTUBE COMMENTS
// -----------------------------
async function getYouTubeComments(videoId) {
    const res = await axios.get(
        "https://www.googleapis.com/youtube/v3/commentThreads",
        {
            params: {
                key: YT_API_KEY,
                part: "snippet",
                videoId: videoId,
                maxResults: 20,
                textFormat: "plainText"
            }
        }
    );

    return res.data.items.map(
        item => item.snippet.topLevelComment.snippet.textDisplay
    );
}

// -----------------------------
// FILTER COMMENTS INTO HINTS
// -----------------------------
function filterHints(comments) {
    return comments.filter(c =>
        c &&
        c.length > 10 &&
        c.length < 140 &&
        !c.toLowerCase().includes("http") &&
        !c.toLowerCase().includes("subscribe") &&
        !c.toLowerCase().includes("first")
    );
}

// -----------------------------
// ROUND ROUTE
// -----------------------------
app.get("/round", async (req, res) => {
    try {
        const video = await getRandomVideo();

        const comments = await getYouTubeComments(video.id);
        const hints = filterHints(comments);

        const comment =
            hints[Math.floor(Math.random() * hints.length)] ||
            "this video was actually insane 💀";

        res.json({
            comment,
            answer: video.title
        });

    } catch (err) {
        console.log("ERROR:", err.message);

        res.json({
            comment: "failed to load video 😭",
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
    } else {
        score = 0;
    }

    res.json({ score });
});

// -----------------------------
// START SERVER
// -----------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
