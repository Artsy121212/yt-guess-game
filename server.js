const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// -----------------------------
// VIDEO DATABASE (ADD YOUR OWN)
// -----------------------------
function getRandomVideo() {
    const videos = [
        {
            title: "Minecraft Hardcore 100 Days",
            tags: ["minecraft", "survival"]
        },
        {
            title: "I Survived 100 Days in Minecraft",
            tags: ["minecraft", "challenge"]
        },
        {
            title: "Fortnite Funny Moments",
            tags: ["fortnite", "gaming"]
        },
        {
            title: "Speedrun World Record Attempt",
            tags: ["speedrun", "gaming"]
        }
    ];

    return videos[Math.floor(Math.random() * videos.length)];
}

// -----------------------------
// HINT SYSTEM (NO API NEEDED)
// -----------------------------
function generateHints(video) {
    const title = video.title.toLowerCase();
    const tags = video.tags || [];
    const hints = [];

    // Minecraft hints
    if (title.includes("minecraft") || tags.includes("minecraft")) {
        hints.push(
            "minecraft content is always chaos 💀",
            "bro really built a whole life out of blocks",
            "survival mode is NOT peaceful here",
            "why is minecraft always suffering"
        );
    }

    // 100 days challenge
    if (title.includes("100 days")) {
        hints.push(
            "100 days is insane dedication",
            "bro did NOT touch grass for months",
            "this challenge takes patience fr",
            "i would’ve quit day 2 💀"
        );
    }

    // Fortnite
    if (title.includes("fortnite") || tags.includes("fortnite")) {
        hints.push(
            "build fights got crazy in this one",
            "bro was cranking 90s for survival",
            "fortnite chaos energy 💀"
        );
    }

    // Speedrun
    if (title.includes("speedrun")) {
        hints.push(
            "this run was way too optimized",
            "milliseconds mattered in this one",
            "speedrunners are built different"
        );
    }

    // fallback hints
    hints.push(
        "this looked harder than expected",
        "people struggled a LOT in this one",
        "this challenge went off the rails 💀"
    );

    return hints;
}

// -----------------------------
// ROUND ROUTE
// -----------------------------
app.get("/round", (req, res) => {
    const video = getRandomVideo();
    const hints = generateHints(video);

    const comment = hints[Math.floor(Math.random() * hints.length)];

    res.json({
        comment,
        answer: video.title,
        tags: video.tags
    });
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
