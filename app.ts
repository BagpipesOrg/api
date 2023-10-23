import express from 'express';

const app = express();
const port = 8080;

// Define a sample route
app.get('/api/data', (req, res) => {
  const jsonData = { message: 'Hello, JSON API!' };
  res.json(jsonData);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
