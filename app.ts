import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { route_tx } from './src/api/txroute';
import { inandoutchannels } from "./src/api/xcmhelper";
import { saveUrl, getUrl } from "./src/api/handledb"
import { broadcastToChain } from './src/api/broadcast';

const app = express();
const port = 8080;

// Use body-parser middleware to parse JSON
app.use(bodyParser.json());
app.use(cors());

// open channels, list open ingoing and outgoing hrmp channels for paraid
app.post('/polkadot/openchannels', async (req, res) => {
  const paraid = req.body.paraid; // get the chains paraid
  if (typeof paraid !== 'number' || paraid < 0 || paraid > 10000) {
    return res.status(400).json({ error: 'Invalid paraid. It must be a number between 0 and 10000.' });
  }
  const channels = await inandoutchannels(paraid);
  res.json({ open_hrmp_channels: channels, sourcechain: paraid });
});

// /broadcast input: {chain: 'hydradx', tx: ''}
app.post('/broadcast', async (req, res) => {
  const chain = req.body.chain;
  const txdata = req.body.tx; // get the chains paraid
  if (chain !== 'polkadot' && chain !== 'hydraDx' && chain !== 'assetHub') {
    return res.status(400).json({ error: 'Invalid chain. Select polkadot/hydraDx/assetHub' });
  }

  //if (typeof txdata !== 'string' || txdata.length > 1) {
  //  return res.status(400).json({ error: 'Invalid txdata.' });
  //}

  try {
    const myhash = await broadcastToChain(chain, txdata);
    console.log(`myhash:`, myhash.toString());
    res.json({ status: "broadcasted", "hash": myhash });
  } catch (error) {
    console.error("Error while broadcasting to the chain:", error);
    res.status(500).json({ error: "An error occurred while broadcasting to the chain." });
  }

});


app.post('/saveUrl', async (req, res) => {
  const longUrl = req.body;

  try {
    const shortUrl = await saveUrl(longUrl);
    res.json({ success: true, shortUrl });
  } catch (error) {
    console.error('Error saving URL:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Get URL
app.get('/getUrl/:shortUrl', async (req, res) => {
  const { shortUrl }: { shortUrl: string } = req.params;

  try {
    const longUrl = await getUrl(shortUrl);
    res.json({ success: true, longUrl });
  } catch (error) {
    console.error('Error getting URL:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// create scenerio 
app.post('/create/scenario', async ( req, res) => {
  res.json({result: "function coming soon"});
} )

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
    const destinationaddress = req.body.destinationaddress;
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
