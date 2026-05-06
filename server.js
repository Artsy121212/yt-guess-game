const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ⚠️ Put your API key here OR use process.env.YT_API_KEY on Render
const YT_API_KEY = process.env.YT_API_KEY;

/*
  EXAMPLE VIDEO FORMAT YOU SHOULD HAVE:
  {
    id: "VIDEO_ID_HERE",
    title: "Video title",
    tags: []
  }
*/

// ----------------------------
// YouTube comments fetch
// ----------------------------
async function getYouTubeComments(videoId) {
    const url = "https://www.googleapis.com/youtube/v3/commentThreads";

    const res = await axios.get(url, {
        params: {
            part: "snippet",
            videoId: videoId,
            maxResults: 20,
            textFormat: "plainText",
            key: YT_API_KEY
        }
    });

    return res.data.items.map(
        item => item.snippet.topLevelComment.snippet.textDisplay
    );
}

// ----------------------------
// Filter comments into usable hints
// ----------------------------
function filterHints(comments) {
    return comments.filter(c =>
        c &&
        c.length > 10 &&
        c.length < 140 &&
        !c.toLowerCase().includes("http") &&
        !c.toLowerCase().includes("first")
    );
}

// ----------------------------
// YOUR VIDEO SOURCE (replace this)
// ----------------------------
function getRandomVideo() {
    const videos = [
        {
            id: "dQw4w9WgXcQ",
            title: "Example Video",
            tags: ["music"]
        }
        // add your own videos here
    ];

    return videos[Math.floor(Math.random() * videos.length)];
}

// ----------------------------
// ROUTE: NEW ROUND
// ----------------------------
app.get("/round", async (req, res) => {
    const video = getRandomVideo();

    try {
        const comments = await getYouTubeComments(video.id);

        const filtered = filterHints(comments);

        const comment =
            filtered[Math.floor(Math.random() * filtered.length)] ||
            "this was actually insane 💀";

        res.json({
            comment,
            answer: video.title,
            tags: video.tags
        });

    } catch (err) {
        console.log("YouTube API failed:", err.message);

        res.json({
            comment: "chat is dead on this one 💀",
            answer: video.title,
            tags: video.tags
        });
    }
});

// ----------------------------
// ROUTE: GUESS CHECK
// ----------------------------
app.post("/guess", (req, res) => {
    const { guess, answer } = req.body;

    let score = 0;

    if (!guess || !answer) {
        return res.json({ score: 0 });
    }

    // simple similarity check
    const g = guess.toLowerCase();
    const a = answer.toLowerCase();

    if (g === a) {
        score = 100;
    } else if (a.includes(g) || g.includes(a)) {
        score = 60;
    } else {
        score = 0;
    }

    res.json({ score });
});

// ----------------------------
// START SERVER
// ----------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
