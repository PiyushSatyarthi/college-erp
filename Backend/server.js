import express from 'express';

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'university-attendance-backend',
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
