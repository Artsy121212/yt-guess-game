const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Use environment variable (Render)
const API_KEY = process.env.YOUTUBE_API_KEY;

// ✅ Use Render port
const PORT = process.env.PORT || 3000;

// 🔁 Helper to safely get random item
function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// 🎮 Get a round
app.get("/round", async (req, res) => {
    try {
        // 🔍 search videos
        const searchRes = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {
                    part: "snippet",
                    q: "gaming OR music OR funny",
                    maxResults: 10,
                    type: "video",
                    key: API_KEY
                }
            }
        );

        const videos = searchRes.data.items.filter(v => v.id.videoId);

        if (videos.length === 0) {
            return res.status(500).json({ error: "No videos found" });
        }

        const video = randomItem(videos);
        const videoId = video.id.videoId;

        // 💬 get comments
        const commentRes = await axios.get(
            "https://www.googleapis.com/youtube/v3/commentThreads",
            {
                params: {
                    part: "snippet",
                    videoId: videoId,
                    maxResults: 10,
                    key: API_KEY
                }
            }
        );

        const comments = commentRes.data.items;

        if (!comments || comments.length === 0) {
            return res.json({
                comment: "No comments found, skipping...",
                answer: video.snippet.title,
                tags: []
            });
        }

        const comment = randomItem(comments)
            .snippet.topLevelComment.snippet.textDisplay;

        res.json({
            comment,
            answer: video.snippet.title,
            tags: [] // YouTube search API doesn’t include tags here
        });

    } catch (err) {
        console.error("ROUND ERROR:", err.message);
        res.status(500).json({ error: "Failed to load round" });
    }
});

// 🧮 Score guess
app.post("/guess", (req, res) => {
    try {
        const { guess, answer } = req.body;

        const words = str => (str || "").toLowerCase().match(/\w+/g) || [];

        const guessWords = words(guess);
        const answerWords = words(answer);

        let match = 0;

        guessWords.forEach(g => {
            if (answerWords.includes(g)) match++;
        });

        const score = Math.floor((match / Math.max(answerWords.length, 1)) * 100);

        res.json({ score });

    } catch (err) {
        console.error("GUESS ERROR:", err.message);
        res.status(500).json({ error: "Failed to score guess" });
    }
});

// 🚀 Start server
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});