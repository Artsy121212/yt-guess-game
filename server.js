const express = require("express");
const path = require("path");

const app = express();

// Serve all static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// Homepage route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Optional: fallback for unknown routes (prevents "Cannot GET /")
app.get("*", (req, res) => {
    res.status(404).send("Page not found");
});

// Port (IMPORTANT for Render)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
