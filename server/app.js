import express from "express";


/// Create the Express app
const app = express();

app.get("/api/health", (req, res) => {
  res.status(200).json({
  ok: true,
  });

});

export default app;