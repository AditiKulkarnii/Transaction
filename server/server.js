import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import cors from 'cors';
import Dataroutes from './Router/DataRoutes.js';
import StatRoutes from './Router/StatRoutes.js';
const app = express();

mongoose.connect(process.env.MONGODB_URL, {
  autoIndex: true
}).then(() => {
  console.log("Database connected Successfully");
}).catch((err) => {
  console.error("database conn err :",err);
});
const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('server running.!');
})



app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
})

app.use(express.json());
app.use(cors());


app.use(Dataroutes);
app.use(StatRoutes);
