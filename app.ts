import express from 'express';
import bodyParser from 'body-parser';

import { route_tx } from './src/api/txroute';

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
app.post('/xcm-asset-transfer', async (req, res) => {
  console.log(`xcm-asset-transfer`);
  console.log(req.body);
  try {
    console.log(`s0`);
    const sourchain = req.body.sourchain;
    console.log(`sourcechain:`, sourchain);
    const destchain = req.body.destchain;
    console.log(`destchain:`, destchain);
    const assetid = req.body.assetid;
    console.log(`assetid:`, assetid);
    const amount = req.body.amount;
    console.log(`amount:`, amount);
    const destinationaddress = req.body.scenarioid;
    console.log(`destinationaddress:`, destinationaddress);
    console.log(`route_tx start`);
    const tx = await route_tx(sourchain, destchain, assetid, amount, destinationaddress);
    console.log(`tx route_tx`);
    res.json({ txdata: tx });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
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
