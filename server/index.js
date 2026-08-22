import express from "express";

/// Create the Express app
const app = express();

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.listen(3000, (error) => {
  if (error) throw error;
  console.log("listening on http://localhost:3000");
});