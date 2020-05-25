const functions = require("firebase-functions");
const express = require("express");
const path = require("path");
const app = express();

// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, "public/")));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public/default.html"));
});

app.get("/login", (req, res) => {
	res.sendFile(path.join(__dirname, "public/userAuth.html"));
});

app.get("/payments", (req, res) => {
	res.sendFile(path.join(__dirname, "public/payments.html"));
});

app.get("/timestamp", (req, res) => {
	res.send(`${Date.now()}`);
});

app.get("/timestamp-cached", (req, res) => {
	res.set("Cache-Control", "public, max-age=300", "s-maxage=300");
	res.send(`${Date.now()}`);
});

exports.app = functions.https.onRequest(app);
