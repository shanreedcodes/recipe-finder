import dotenv from 'dotenv';
import express from "express";


dotenv.config();


/// Create the Express app
const app = express();

app.get("/api/health", (req, res) => {
  res.status(200).json({
  ok: true,
  });

});

app.listen(process.env.PORT|| 3001, (error) => {
  if (error) throw error;
  console.log(`listening on http://localhost:${process.env.PORT || 3001}`);
});