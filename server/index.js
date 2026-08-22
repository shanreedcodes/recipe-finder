import express from "express";

/// Create the Express app
const app = express();

app.get("/api/health", (req, res) => {
  res.status(200).json({
  ok: true,
  });

});

app.listen(3000, (error) => {
  if (error) throw error;
  console.log("listening on http://localhost:3000");
});