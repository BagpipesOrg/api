import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { route_tx } from './src/api/txroute';
import { inandoutchannels } from "./src/api/xcmhelper";
import { saveUrl, getUrl } from "./src/api/handledb"
import { broadcastToChain } from './src/api/broadcast';
import { isValidChain } from './src/api/Chains';
import { createWebhook } from './src/utils';
import logger from './src/logger';
import { decompressString, scenario_info, insert_scenario, scenario_detailed_info } from './src/scenarios/parse_db';


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

// tx broadcast
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
  //   console.log(`myhash:`, myhash.toString());
    res.json({ status: "broadcasted", "hash": myhash });
  } catch (error) {
    console.error("Error while broadcasting to the chain:", error);
    res.status(500).json({ error: "An error occurred while broadcasting to the chain." });
  }

});


// Save Scenario 
//router.post('/save', verifyToken, async (req, res) => {

// save data and generate storage key/short url key
app.post('/saveUrl', async (req, res) => {
  const longUrl = req.body;
  //console.log(`Saving `, longUrl);
  try {
   // console.log(`saving it`);
    const shortUrl = await saveUrl(longUrl);
  //  console.log(`after save shortUrl:`, shortUrl);
    res.json({ success: true, shortUrl });
  } catch (error) {
    console.error('Error saving URL:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.get('/', async (req, res) => {
    res.json({ success: true, documentation: "https://xcmsend.github.io/api/index.html" });
});

// Get URL
app.get('/getUrl/:shortUrl', async (req, res) => {
  const { shortUrl }: { shortUrl: string } = req.params;
// console.log(`geturl`);
  try {
    const longUrl = await getUrl(shortUrl);
  //   console.log(`getUrl: `, shortUrl);
    res.json({ success: true, longUrl });
  } catch (error) {
    console.error('Error getting URL:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



// curl -X POST -H "Content-Type: application/json" -d '{"source_chain": "polkadot", "dest_chain": "hydraDx", "source_address": "your_source_address", "amount": 100, "assetid": 1}' http://localhost:8080/create/scenario
// {"result":"QWdI3KifK"}
// create scenerio 
app.post('/create/scenario', async ( req, res) => {

  const source_chain: string = req.body.source_chain;
  const dest_chain: string = req.body.dest_chain;
  const source_address: string = req.body.source_address;
  const amount: number = req.body.amount; 
  const assetid: number = req.body.assetid;

  // Validation checks
  if (!isValidChain(source_chain)) {
    return res.status(400).json({ error: 'Invalid source_chain provided.' });
  }

  if (!isValidChain(dest_chain)) {
    return res.status(400).json({ error: 'Invalid dest_chain provided.' });
  }



  if (!source_chain || typeof source_chain !== 'string') {
    return res.status(400).json({ error: 'Invalid source_chain provided.' });
  }

  if (!dest_chain || typeof dest_chain !== 'string') {
    return res.status(400).json({ error: 'Invalid dest_chain provided.' });
  }

  if (!source_address || typeof source_address !== 'string') {
    return res.status(400).json({ error: 'Invalid source_address provided.' });
  }

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount provided.' });
  }

  if (isNaN(assetid) || assetid <= 0) {
    return res.status(400).json({ error: 'Invalid assetid provided.' });
  }

  const shorturl = await insert_scenario(source_chain, dest_chain, source_address, amount, assetid);
  console.log(`got the shorturl:` , shorturl);
  
  res.json({result: shorturl});
} );


// curl -X POST -H "Content-Type: application/json" -d '{"id": "scenario_id_here"}' http://localhost:8080/scenario/info
// get info about a certain scenario
app.post('/scenario/info', async (req, res) => {
  const scenario_id = req.body.id;
//  console.log(`scenario info`);
  if (!scenario_id) {
    return res.json({result: "No scenario id detected, provide a request like this: curl -X ENDPOINT/scenario/info -d {'id':'my scenario id here'}"});
  };

  const get_data = await getUrl(scenario_id);
    if (!get_data) {
    return res.json({result: "Could not find the scenario data"});
  };

//  console.log(`get_data is:`, get_data);
  const decoded = await decompressString(get_data);
//  console.log(`decoded: `, decoded);
  const out = await scenario_info(decoded);
//  console.log(`out is:`, out);


  res.json({result: out})
});

/*
Provide a vector of output [ node0_info, node1_info, node1 ]
*/
// display full scenario info
// curl -X POST -H "Content-Type: application/json" -d '{"id": "a-aPVjoub"}' http://localhost:8080/scenario/info/full
app.post('/scenario/info/full', async (req, res) => {

  const output = {
    tx: 'could not find',
    summary: 'could not find',
    asset: 'could not find',
    amount: 'could not find',
    source_chain: 'could not find',
    dest_chain: 'could not find',
    txtype: 'could not find'
  }

  const scenario_id = req.body.id;


  if (!scenario_id) {
    return res.json({result: "No scenario id detected, provide a request like this: curl -X ENDPOINT/scenario/info -d {'id':'my scenario id here'}"});
  };
  try {
    const get_data = await getUrl(scenario_id);
    if (!get_data) {
      return res.json({result: "Could not find the scenario data"});
    };
    //  console.log(`get_data is:`, get_data);
      const decoded = await decompressString(get_data);
  //   console.log(`decoded: `, decoded);
    const deep_coded = await scenario_detailed_info(JSON.parse(decoded));
  //   console.log(`deep info:`, deep_coded);
    //  const out = await scenario_info(decoded);
      output['summary'] = deep_coded.source_chain + " > " + deep_coded.tx_type + " > " + deep_coded.dest_chain;
      output['txtype'] = deep_coded.tx_type;
      output['amount'] = deep_coded.source_amount;
      output['asset'] = deep_coded.source_asset;
      output['dest_chain'] = deep_coded.dest_chain;
      output['source_chain'] = deep_coded.source_chain;
  //     console.log(`output is:`, output);
   //   const tx = await route_tx(sourchain, destchain, output['asset'], output['amount'], destinationaddress);
 //    console.log(`source chain: `, deep_coded.source_chain);
 //    console.log(`dest chain: `, deep_coded.dest_chain);
  //   console.log(`dest address: `, deep_coded.dest_address);
   try {
    const tx = await route_tx(deep_coded.source_chain, deep_coded.dest_chain, parseFloat(output['asset']), parseFloat(output['amount']), deep_coded.dest_address);
    //   console.log(`tx is: `, tx.toHex());
      output['tx'] = tx.toHex();
   } catch (error) {
    output['tx'] = "could not generate tx"
   };

   } catch (error) {
    console.log(`got error:`, error);

    return res.json({error: "Invalid scenario id"});
  }

  // console.log(`output is:`, output);

  res.json({result: output})
});

// curl -X POST -H "Content-Type: application/json" http://localhost:8080/create/webhook
app.post('/create/webhook', createWebhook);

/*
app.post('/create/webhook', async ( req, res) => {
  res.json({result: "function coming soon"});
} );
*/



/*
/execute
/createScenario
router.get('/load/:_id', verifyToken, async (req, res) => {
router.post('/stopExecution', verifyToken, async (req, res) => {
router.post('/createWebhook', async (req, res) => {
router.post('/receiveWebhook', async (req, res) => {
*/


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


//
// db info, display metadata about stored scenarios, amount and so on



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
