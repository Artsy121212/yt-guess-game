const express = require("express");
const path = require("path");

const app = express();

// IMPORTANT: make sure static files work first
app.use(express.static(path.join(__dirname, "public")));

// homepage (safe fallback)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// debug route (super important for testing)
app.get("/test", (req, res) => {
    res.send("Server is alive");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
