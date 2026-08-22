import dotenv from 'dotenv';
import app from './app.js'

dotenv.config();


app.listen(process.env.PORT|| 3001, (error) => {
  if (error) throw error;
  console.log(`listening on http://localhost:${process.env.PORT || 3001}`);
});