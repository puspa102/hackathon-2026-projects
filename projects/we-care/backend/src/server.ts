import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import extractRouter from './routes/extract';
import specialistsRouter from './routes/specialists';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', project: 'RefAI' });
});

app.use('/api/extract', extractRouter);
app.use('/api/specialists', specialistsRouter);

app.listen(PORT, () => {
  console.log(`RefAI backend running on port ${PORT}`);
});

export default app;
