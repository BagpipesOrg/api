import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 8080;

// Use body-parser middleware to parse JSON
app.use(bodyParser.json());

// open channels, list open ingoing and outgoing hrmp channels for paraid
app.post('/polkadot/openchannels', (req, res) => {
  const jsonData = req.body.paraid; // get the chains paraid
  res.json({ receivedData: jsonData });
});

// create scenerio 


// Define a POST route to handle JSON data
app.post('/api/data', (req, res) => {
  const jsonData = req.body;
  res.json({ receivedData: jsonData });
});



// tx broadcast

// xcm asset transfer
// call a scenerio - call a scenario you created in the UI - todo
app.post('/polkadot/xcm-asset-transfer', (req, res) => {
  const jsonData = req.body.scenarioid;
  res.json({ receivedData: "todo" });
});

app.post('/polkadot/xcm-native-transfer', (req, res) => {
  const jsonData = req.body.scenarioid;
  res.json({ receivedData: "todo" });
});




// use template - todo
app.post('/call/template', (req, res) => {
  const jsonData = req.body.scenarioid;
  res.json({ receivedData: "todo" });
});



// call a scenerio - call a scenario you created in the UI - todo
app.post('/call/scenario', (req, res) => {
  const jsonData = req.body.scenarioid;
  res.json({ receivedData: "todo" });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
