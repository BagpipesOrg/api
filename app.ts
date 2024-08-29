import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
//import session from 'express-session'

import { createServer } from 'http'

import { saveUrl, getUrl } from './src/api/handledb'
import { isValidChain } from './src/api/Chains'
import { createWebhook } from './src/utils'
import logger from './src/logger'
import {
  decompressString,
  scenario_info,
  insert_scenario,
  scenario_detailed_info,
  multi_scenario_info,
  create_swap,
} from './src/scenarios/parse_db'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 8080
const ENV = process.env.NODE_ENV || 'development'

import testRoute from './src/routes/test'
import scenarioRoute from './src/routes/scenario'
import webhookRoute from './src/routes/webhook'
import httpRoute from './src/routes/http'
import hrmpRoute from './src/routes/hrmp'
import chainRoute from './src/routes/chain'
import templateRoute from './src/routes/template'
import actionsRoute from './src/routes/actions'
import inkRoute from './src/routes/ink'

import PreviewRoute from './src/routes/preview'


// // CORS options
const corsOptions = {
  origin: ENV === 'development' ? process.env.DEV_URL : process.env.PROD_URL,
  credentials: false,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))
//app.use(express.json());

// TODO
//app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));

// Use body-parser middleware to parse JSON
app.use(bodyParser.json())
app.use(cors())

app.use(express.urlencoded({ extended: false }))
// app.use(bodyParser.json());

app.use(cookieParser(process.env.COOKIE_PARSER_SECRET))
/*
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
*/

app.use((req, res, next) => {
  // req.io = io;
  console.log('Time:', Date.now())
  console.log('Request Body in app.js:', req.body)
  next()
})

app.use('/api/test', testRoute)
app.use('/api/scenario', scenarioRoute)
app.use('/api/webhook', webhookRoute)
app.use('/api/http', httpRoute)
app.use('/api/hrmp', hrmpRoute)
app.use('/api/chain', chainRoute)
app.use('/api/template', templateRoute)
app.use('/api/actions', actionsRoute)
app.use('/api/ink', inkRoute)
app.use('/api/info', PreviewRoute)


app.get('/', async (req, res) => {
  res.json({ success: true, documentation: 'https://docs.bagpipes.io/docs/api/docs' })
})

const httpServer = createServer(app)

// Listen for HTTP connections.
httpServer.listen(PORT, () => {
  logger.info(`Server is listening and running on port ${PORT}`)
})

// // todo add kusamas
// // open channels, list open ingoing and outgoing hrmp channels for paraid
// app.post('/polkadot/openchannels', async (req, res) => {
//   const paraid = req.body.paraid // get the chains paraid
//   if (typeof paraid !== 'number' || paraid < 0 || paraid > 10000) {
//     return res.status(400).json({ error: 'Invalid paraid. It must be a number between 0 and 10000.' })
//   }
//   const channels = await inandoutchannels(paraid)
//   res.json({ open_hrmp_channels: channels, sourcechain: paraid })
// })

// // tx broadcast
// // /broadcast input: {chain: 'hydradx', tx: ''}
// app.post('/broadcast', async (req, res) => {
//   const chain = req.body.chain
//   const txdata = req.body.tx // get the chains paraid
//   if (chain !== 'polkadot' && chain !== 'hydraDx' && chain !== 'assetHub') {
//     return res.status(400).json({ error: 'Invalid chain. Select polkadot/hydraDx/assetHub' })
//   }

//   //if (typeof txdata !== 'string' || txdata.length > 1) {
//   //  return res.status(400).json({ error: 'Invalid txdata.' });
//   //}

//   try {
//     const myhash = await broadcastToChain(chain, txdata)
//     //   console.log(`myhash:`, myhash.toString());
//     res.json({ status: 'broadcasted', hash: myhash })
//   } catch (error) {
//     console.error('Error while broadcasting to the chain:', error)
//     res.status(500).json({ error: 'An error occurred while broadcasting to the chain.' })
//   }
// })

// // Save Scenario
// //router.post('/save', verifyToken, async (req, res) => {

// // save data and generate storage key/short url key
// app.post('/saveUrl', async (req, res) => {
//   const longUrl = req.body
//   //console.log(`Saving `, longUrl);
//   try {
//     // console.log(`saving it`);
//     const shortUrl = await saveUrl(longUrl)
//     //  console.log(`after save shortUrl:`, shortUrl);
//     res.json({ success: true, shortUrl })
//   } catch (error) {
//     console.error('Error saving URL:', error)
//     res.status(500).json({ success: false, error: 'Internal Server Error' })
//   }
// })

// app.get('/', async (req, res) => {
//   res.json({ success: true, documentation: 'https://xcmsend.github.io/api/index.html' })
// })

// // Get URL
// app.get('/getUrl/:shortUrl', async (req, res) => {
//   const { shortUrl }: { shortUrl: string } = req.params
//   // console.log(`geturl`);
//   try {
//     const longUrl = await getUrl(shortUrl)
//     //   console.log(`getUrl: `, shortUrl);
//     res.json({ success: true, longUrl })
//   } catch (error) {
//     console.error('Error getting URL:', error)
//     res.status(500).json({ success: false, error: 'Internal Server Error' })
//   }
// })

// bagpipes: swap assetin to assetout amount
// curl -X POST -H "Content-Type: application/json" -d '{"assetin": "0", "assetout": "5", "amount": 100 }' http://localhost:8080/create/swap

// app.post('/create/swap', async (req, res) => {
//   console.log(`create swap called`);
//   console.log(`create swap: `, req.body);
//   try {
//     console.log(`output: `, req.body.assetin, req.body.assetout, req.body.amount);

//     const assetin: number = parseInt(req.body.assetin, 10)
//     const assetout: number = parseInt(req.body.assetout, 10)
//     const amount: number = parseInt(req.body.amount, 10)

//     if (typeof assetin !== 'number' ||
//         typeof assetout !== 'number' ||
//         typeof amount !== 'number' ||
//         isNaN(assetin) ||
//         isNaN(assetout) ||
//         isNaN(amount)) {
//           return res
//           .status(400)
//           .json({ error: 'Missing required fields, view documentation: https://xcmsend.github.io/api/docs.html' })
//         }

//         console.log(`pling plong`);

//     // Validate that the parsed values are valid numbers
//     if (isNaN(assetin) || isNaN(assetout) || isNaN(amount)) {
//       return res.status(400).json({ error: 'submit assetid, amount and assetout as numbers ' })
//     }

//     const out = await create_swap(assetin, assetout, amount)
//     res.status(200).json({ success: true, swap: out })
//   } catch (error) {
//     console.error(error)
//     res
//       .status(500)
//       .json({
//         error: 'Internal Server Error, reach fellow developers on bagpipes discord: https://discord.gg/ZBfmzJ7Jjz',
//       })
//   }
// })

// // curl -X POST -H "Content-Type: application/json" -d '{"chain": "polkadot", "msg": "hack the planet"}' http://localhost:8080/system-remark
// app.post('/system-remark', async (req, res) => {
//   const chain: string = req.body.chain;
//   const msg: string = req.body.msg;
//   const chains = ["turing", "moonriver", "mangatax", "assetHub", "interlay", "hydraDx", 'polkadot'];
//   if (!chains.includes(chain)) {
//     return res.json({error: "invalid chain, select one of: turing, moonriver, mangatax, assetHub, interlay, hydraDx, polkadot"});
//   }
//   console.log(`making system remark with: `, chain, msg);
//   const tx = (await generic_system_remark(chain, msg)).toHex();
//   res.json({ result: tx })
// })

// // curl -X POST -H "Content-Type: application/json" -d '{"source_chain": "polkadot", "dest_chain": "hydraDx", "destination_address": "your_destination_address", "amount": 100, "assetid": 1}' http://localhost:8080/create/scenario
// // {"result":"QWdI3KifK"}
// // create scenerio
// //
// // xcmsend: assetid1984 from assethub to hydra destaddress
// app.post('/create/scenario', async (req, res) => {
//   const source_chain: string = req.body.source_chain
//   const dest_chain: string = req.body.dest_chain
//   const dest_address: string = req.body.destination_address // this should be dest_address
//   const amount: number = req.body.amount
//   const assetid: number = req.body.assetid

//   // Validation checks
//   if (!isValidChain(source_chain)) {
//     return res.status(400).json({ error: 'Invalid source_chain provided.' })
//   }

//   if (!isValidChain(dest_chain)) {
//     return res.status(400).json({ error: 'Invalid dest_chain provided.' })
//   }

//   if (!source_chain || typeof source_chain !== 'string') {
//     return res.status(400).json({ error: 'Invalid source_chain provided.' })
//   }

//   if (!dest_chain || typeof dest_chain !== 'string') {
//     return res.status(400).json({ error: 'Invalid dest_chain provided.' })
//   }

//   if (!dest_address || typeof dest_address !== 'string') {
//     return res.status(400).json({ error: 'Invalid destination_address provided.' })
//   }

//  if (dest_address || dest_chain == "moonriver" || !dest_address.startsWith("0x")) {
//   return res.status(400).json({error: "give me an evm address for moonbeams destinatino_address"})
//  }

//   if (isNaN(amount) || amount <= 0) {
//     return res.status(400).json({ error: 'Invalid amount provided.' })
//   }

//   if (isNaN(assetid) || assetid < 0) {
//     return res.status(400).json({ error: 'Invalid assetid provided.' })
//   }

//   const shorturl = await insert_scenario(source_chain, dest_chain, dest_address, amount, assetid)
//   console.log(`got the shorturl:`, shorturl)

//   res.json({ result: shorturl })
// })

// // curl -X POST -H "Content-Type: application/json" -d '{"id": "scenario_id_here"}' http://localhost:8080/scenario/info
// // get info about a certain scenario
// app.post('/scenario/info', async (req, res) => {
//   const scenario_id = req.body.id
//   //  console.log(`scenario info`);
//   if (!scenario_id) {
//     return res.json({
//       result:
//         "No scenario id detected, provide a request like this: curl -X ENDPOINT/scenario/info -d {'id':'my scenario id here'}",
//     })
//   }

//   const get_data = await getUrl(scenario_id)
//   if (!get_data) {
//     return res.json({ result: 'Could not find the scenario data' })
//   }

//   //  console.log(`get_data is:`, get_data);
//   const decoded = await decompressString(get_data)
//   //  console.log(`decoded: `, decoded);
//   const out = await scenario_info(decoded)
//   //  console.log(`out is:`, out);

//   res.json({ result: out })
// })

// /*
// Provide a vector of output [ node0_info, node1_info, node1 ]
// */
// // display full scenario info
// // curl -X POST -H "Content-Type: application/json" -d '{"id": "a-aPVjoub"}' http://localhost:8080/scenario/info/full
// app.post('/scenario/info/full', async (req, res) => {
//   const output = {
//     tx: 'could not find',
//     summary: 'could not find',
//     asset: 'could not find',
//     amount: 'could not find',
//     source_chain: 'could not find',
//     dest_chain: 'could not find',
//     txtype: 'could not find',
//   }

//   const scenario_id = req.body.id
//   console.log(`got user input:`, scenario_id);
//   if (!scenario_id) {
//     console.log(`no scenario id`);
//     return res.json({
//       result:
//         "No scenario id detected, provide a request like this: curl -X ENDPOINT/scenario/info -d {'id':'my scenario id here'}",
//     })
//   }
//   try {
//     console.log(`calling get url`);
//     const get_data = await getUrl(scenario_id)
//     if (!get_data) {
//        console.log(`did not get data`);
//       return res.json({ result: 'Could not find the scenario data' })
//     }
//     console.log(`get_data is:`, get_data);
//     const decoded = await decompressString(get_data)
//     console.log(`decoded: `, decoded);
//     const deep_coded = await scenario_detailed_info(JSON.parse(decoded))
//     console.log(`deep info:`, deep_coded);
//     //  const out = await scenario_info(decoded);
//     output['summary'] = deep_coded.source_chain + ' > ' + deep_coded.tx_type + ' > ' + deep_coded.dest_chain
//     output['txtype'] = deep_coded.tx_type
//     output['amount'] = deep_coded.source_amount
//     output['asset'] = deep_coded.source_asset
//     output['dest_chain'] = deep_coded.dest_chain
//     output['source_chain'] = deep_coded.source_chain
//     //     console.log(`output is:`, output);
//     //   const tx = await route_tx(sourchain, destchain, output['asset'], output['amount'], destinationaddress);
//     //    console.log(`source chain: `, deep_coded.source_chain);
//     //    console.log(`dest chain: `, deep_coded.dest_chain);
//     //   console.log(`dest address: `, deep_coded.dest_address);
//     try {
//       const tx = await route_tx(
//         deep_coded.source_chain,
//         deep_coded.dest_chain,
//         parseFloat(output['asset']),
//         parseFloat(output['amount']),
//         deep_coded.dest_address,
//       )
//       console.log(`tx is: `, tx.toHex());
//       output['tx'] = tx.toHex()
//     } catch (error) {
//       console.log(`tx gen error: `, error);
//       output['tx'] = 'could not generate tx'
//     }
//   } catch (error) {
//     console.log(`got error:`, error)

//     return res.json({ error: 'Invalid scenario id' })
//   }

//   // console.log(`output is:`, output);

//   res.json({ result: output })
// })

// // curl -X POST -H "Content-Type: application/json" -d '{"id": "frb-UXJuK"}' http://localhost:8080/scenario/info/multi
// // sample output: {"result":{"scenarios":[{"source_chain":"polkadot","source_address":"5HdRaUshTGoQFatoJ7Wg9Skg7BLCjfJaV5V9qYNoqR7zfX5B","dest_chain":"assetHub","dest_address":"5HdRaUshTGoQFatoJ7Wg9Skg7BLCjfJaV5V9qYNoqR7zfX5B","assetid":0,"amount":"13","txtype":"xTransfer","tx":"not set","source_amount":"13"},{"source_chain":"assetHub","source_address":"5HdRaUshTGoQFatoJ7Wg9Skg7BLCjfJaV5V9qYNoqR7zfX5B","dest_chain":"polkadot","dest_address":"5HdRaUshTGoQFatoJ7Wg9Skg7BLCjfJaV5V9qYNoqR7zfX5B","assetid":"3","amount":"3","txtype":"xTransfer","tx":"not set","source_amount":"3"},{"source_chain":"polkadot","source_address":"5HdRaUshTGoQFatoJ7Wg9Skg7BLCjfJaV5V9qYNoqR7zfX5B","dest_chain":"assetHub","dest_address":"5HdRaUshTGoQFatoJ7Wg9Skg7BLCjfJaV5V9qYNoqR7zfX5B","assetid":0,"amount":"1","txtype":"xTransfer","tx":"not set","source_amount":"1"}]}}
// // parse multiscenario, action node only
// app.post('/scenario/info/multi', async (req, res) => {
//   const scenario_id = req.body.id

//   if (!scenario_id) {
//     return res.json({
//       result:
//         "No scenario id detected, provide a request like this: curl -X ENDPOINT/scenario/info -d {'id':'my scenario id here'}",
//     })
//   }
//   const get_data = await getUrl(scenario_id)
//   if (!get_data) {
//     return res.json({ result: 'Could not find the scenario data' })
//   }
//   const decoded = await decompressString(get_data)
//   //   console.log(`decoded: `, decoded);
//   const multisdaat = multi_scenario_info(JSON.parse(decoded))
//   //  console.log(`multisdaat:`, multisdaat);
//   //  console.log(`multisdaat done`);
//   return res.json({ result: { scenarios: multisdaat } })
// })

// // curl -X POST -H "Content-Type: application/json" http://localhost:8080/create/webhook
// app.post('/create/webhook', createWebhook)

// /*
// app.post('/create/webhook', async ( req, res) => {
//   res.json({result: "function coming soon"});
// } );
// */

/*
/execute
/createScenario
router.get('/load/:_id', verifyToken, async (req, res) => {
router.post('/stopExecution', verifyToken, async (req, res) => {
router.post('/createWebhook', async (req, res) => {
router.post('/receiveWebhook', async (req, res) => {
*/

// // xcm asset transfer
// // call a scenerio - call a scenario you created in the UI - todo
// app.post('/xcm-asset-transfer', async (req, res) => {
//   console.log(`xcm-asset-transfer`)
//   console.log(req.body)
//   try {
//     console.log(`s0`)
//     const sourchain = req.body.sourchain
//     console.log(`sourcechain:`, sourchain)
//     const destchain = req.body.destchain
//     console.log(`destchain:`, destchain)
//     const assetid = req.body.assetid
//     console.log(`assetid:`, assetid)
//     const amount = req.body.amount
//     console.log(`amount:`, amount)
//     const destinationaddress = req.body.destinationaddress
//     console.log(`destinationaddress:`, destinationaddress)
//     console.log(`route_tx start`)
//     const tx = await route_tx(sourchain, destchain, assetid, amount, destinationaddress)
//     console.log(`tx route_tx`)
//     res.json({ txdata: tx })
//   } catch (error) {
//     res.status(500).json({ error: 'An error occurred' })
//   }
// })

// app.post('/polkadot/xcm-native-transfer', (req, res) => {
//   const jsonData = req.body.scenarioid
//   res.json({ receivedData: 'todo' })
// })

//
// db info, display metadata about stored scenarios, amount and so on

// // use template - todo
// app.post('/template/call', (req, res) => {
//   const jsonData = req.body.scenarioid
//   res.json({ receivedData: 'todo' })
// })

// // call a scenerio - call a scenario you created in the UI - todo
// app.post('/scenario/call', (req, res) => {
//   const jsonData = req.body.scenarioid
//   res.json({ receivedData: 'todo' })
// })

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`)
// })
