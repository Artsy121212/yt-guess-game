const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.YOUTUBE_API_KEY;

// get random video + comment
app.get("/round", async (req, res) => {
    try {
        // search random video
        const search = await axios.get(
            `https://www.googleapis.com/youtube/v3/search`,
            {
                params: {
                    part: "snippet",
                    q: "random",
                    maxResults: 10,
                    key: API_KEY
                }
            }
        );

        const video =
            search.data.items[Math.floor(Math.random() * search.data.items.length)];

        const videoId = video.id.videoId;

        // get comments
        const comments = await axios.get(
            `https://www.googleapis.com/youtube/v3/commentThreads`,
            {
                params: {
                    part: "snippet",
                    videoId: videoId,
                    maxResults: 10,
                    key: API_KEY
                }
            }
        );

        const comment =
            comments.data.items[Math.floor(Math.random() * comments.data.items.length)]
                .snippet.topLevelComment.snippet.textDisplay;

        res.json({
            comment,
            answer: video.snippet.title,
            tags: video.snippet.tags || [],
            description: video.snippet.description
        });
    } catch (err) {
        res.status(500).send("error");
    }
});

app.post("/guess", (req, res) => {
    const { guess, answer, tags } = req.body;

    const words = str => str.toLowerCase().match(/\w+/g) || [];

    const guessWords = words(guess);
    const answerWords = words(answer);

    let match = 0;

    guessWords.forEach(g => {
        if (answerWords.includes(g)) match++;
    });

    const score = Math.floor((match / answerWords.length) * 100);

    res.json({ score });
});

app.listen(3000, () => console.log("Server running"));