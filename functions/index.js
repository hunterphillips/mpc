const functions = require("firebase-functions");
const express = require("express");
const path = require("path");
const app = express();

// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, "public/")));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/login", (req, res) => {
	const fullPath = path.resolve(__dirname, "../public/userAuth.html");
	// res.sendFile(path.join(__dirname, "../public/userAuth.html"));
	res.sendfile(fullPath);
});

app.get("/timestamp", (req, res) => {
	res.send(`${Date.now()}`);
});

app.get("/timestamp-cached", (req, res) => {
	res.set("Cache-Control", "public, max-age=300", "s-maxage=300");
	res.send(`${Date.now()}`);
});

exports.app = functions.https.onRequest(app);
