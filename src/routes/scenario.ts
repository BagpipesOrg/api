
import { Router } from 'express';
// import startScenarioExecution  from '../services/startScenarioExecution.js';
// import Execution from '../models/Execution.js';
// import ExecutionLog from '../models/ExecutionLog.js';
// import UserMetadata from '../models/UserMetadata.js';
// import Scenario from '../models/Scenario.js';
// import verifyToken from '../services/verifyToken.js';
// import executionQueue from '../jobs/jobQueue.js';  
// import { saveScenario } from '../utils/saveToDb.js';


import { getUrl } from './../api/handledb'
import { isValidChain } from './../api/Chains'
import { route_tx } from './../api/txroute'

import {
  decompressString,
  scenario_info,
  insert_scenario,
  scenario_detailed_info,
  multi_scenario_info,
  create_swap,
} from './../scenarios/parse_db'


const router = Router();

////// FILIP ADDITIONS

// curl -X POST -H "Content-Type: application/json" -d '{"source_chain": "polkadot", "dest_chain": "hydraDx", "destination_address": "your_destination_address", "amount": 100, "assetid": 1}' http://localhost:8080/create/scenario
// {"result":"QWdI3KifK"}
// create scenerio
//
// xcmsend: assetid1984 from assethub to hydra destaddress
router.post('/create', async (req, res) => {
  const source_chain: string = req.body.source_chain
  const dest_chain: string = req.body.dest_chain
  const dest_address: string = req.body.destination_address // this should be dest_address
  const amount: number = req.body.amount
  const assetid: number = req.body.assetid

  // Validation checks
  if (!isValidChain(source_chain)) {
    return res.status(400).json({ error: 'Invalid source_chain provided.' })
  }

  if (!isValidChain(dest_chain)) {
    return res.status(400).json({ error: 'Invalid dest_chain provided.' })
  }

  if (!source_chain || typeof source_chain !== 'string') {
    return res.status(400).json({ error: 'Invalid source_chain provided.' })
  }

  if (!dest_chain || typeof dest_chain !== 'string') {
    return res.status(400).json({ error: 'Invalid dest_chain provided.' })
  }

  if (!dest_address || typeof dest_address !== 'string') {
    return res.status(400).json({ error: 'Invalid destination_address provided.' })
  }

 if (dest_address || dest_chain == "moonriver" || !dest_address.startsWith("0x")) {
  return res.status(400).json({error: "give me an evm address for moonbeams destinatino_address"})
 }

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount provided.' })
  }

  if (isNaN(assetid) || assetid < 0) {
    return res.status(400).json({ error: 'Invalid assetid provided.' })
  }

  const shorturl = await insert_scenario(source_chain, dest_chain, dest_address, amount, assetid)
  console.log(`got the shorturl:`, shorturl)

  res.json({ result: shorturl })
})

// curl -X POST -H "Content-Type: application/json" -d '{"id": "scenario_id_here"}' http://localhost:8080/scenario/info
// get info about a certain scenario
router.post('/info', async (req, res) => {
  const scenario_id = req.body.id
  //  console.log(`scenario info`);
  if (!scenario_id) {
    return res.json({
      result:
        "No scenario id detected, provide a request like this: curl -X ENDPOINT/scenario/info -d {'id':'my scenario id here'}",
    })
  }

  const get_data = await getUrl(scenario_id)
  if (!get_data) {
    return res.json({ result: 'Could not find the scenario data' })
  }

  //  console.log(`get_data is:`, get_data);
  const decoded = await decompressString(get_data)
  //  console.log(`decoded: `, decoded);
  const out = await scenario_info(decoded)
  //  console.log(`out is:`, out);

  res.json({ result: out })
})

/*
Provide a vector of output [ node0_info, node1_info, node1 ]
*/
// display full scenario info
// curl -X POST -H "Content-Type: application/json" -d '{"id": "a-aPVjoub"}' http://localhost:8080/scenario/info/full
router.post('/info/full', async (req, res) => {
  const output = {
    tx: 'could not find',
    summary: 'could not find',
    asset: 'could not find',
    amount: 'could not find',
    source_chain: 'could not find',
    dest_chain: 'could not find',
    txtype: 'could not find',
  }

  const scenario_id = req.body.id
  console.log(`got user input:`, scenario_id);
  if (!scenario_id) {
    console.log(`no scenario id`);
    return res.json({
      result:
        "No scenario id detected, provide a request like this: curl -X ENDPOINT/scenario/info -d {'id':'my scenario id here'}",
    })
  }
  try {
    console.log(`calling get url`);
    const get_data = await getUrl(scenario_id)
    if (!get_data) {
       console.log(`did not get data`);
      return res.json({ result: 'Could not find the scenario data' })
    }
    console.log(`get_data is:`, get_data);
    const decoded = await decompressString(get_data)
    console.log(`decoded: `, decoded);
    const deep_coded = await scenario_detailed_info(JSON.parse(decoded))
    console.log(`deep info:`, deep_coded);
    //  const out = await scenario_info(decoded);
    output['summary'] = deep_coded.source_chain + ' > ' + deep_coded.tx_type + ' > ' + deep_coded.dest_chain
    output['txtype'] = deep_coded.tx_type
    output['amount'] = deep_coded.source_amount
    output['asset'] = deep_coded.source_asset
    output['dest_chain'] = deep_coded.dest_chain
    output['source_chain'] = deep_coded.source_chain
    //     console.log(`output is:`, output);
    //   const tx = await route_tx(sourchain, destchain, output['asset'], output['amount'], destinationaddress);
    //    console.log(`source chain: `, deep_coded.source_chain);
    //    console.log(`dest chain: `, deep_coded.dest_chain);
    //   console.log(`dest address: `, deep_coded.dest_address);
    try {
      const tx = await route_tx(
        deep_coded.source_chain,
        deep_coded.dest_chain,
        parseFloat(output['asset']),
        parseFloat(output['amount']),
        deep_coded.dest_address,
      )
      console.log(`tx is: `, tx.toHex());
      output['tx'] = tx.toHex()
    } catch (error) {
      console.log(`tx gen error: `, error);
      output['tx'] = 'could not generate tx'
    }
  } catch (error) {
    console.log(`got error:`, error)

    return res.json({ error: 'Invalid scenario id' })
  }

  // console.log(`output is:`, output);

  res.json({ result: output })
})

// curl -X POST -H "Content-Type: application/json" -d '{"id": "frb-UXJuK"}' http://localhost:8080/scenario/info/multi
// sample output: {"result":{"scenarios":[{"source_chain":"polkadot","source_address":"5HdRaUshTGoQFatoJ7Wg9Skg7BLCjfJaV5V9qYNoqR7zfX5B","dest_chain":"assetHub","dest_address":"5HdRaUshTGoQFatoJ7Wg9Skg7BLCjfJaV5V9qYNoqR7zfX5B","assetid":0,"amount":"13","txtype":"xTransfer","tx":"not set","source_amount":"13"},{"source_chain":"assetHub","source_address":"5HdRaUshTGoQFatoJ7Wg9Skg7BLCjfJaV5V9qYNoqR7zfX5B","dest_chain":"polkadot","dest_address":"5HdRaUshTGoQFatoJ7Wg9Skg7BLCjfJaV5V9qYNoqR7zfX5B","assetid":"3","amount":"3","txtype":"xTransfer","tx":"not set","source_amount":"3"},{"source_chain":"polkadot","source_address":"5HdRaUshTGoQFatoJ7Wg9Skg7BLCjfJaV5V9qYNoqR7zfX5B","dest_chain":"assetHub","dest_address":"5HdRaUshTGoQFatoJ7Wg9Skg7BLCjfJaV5V9qYNoqR7zfX5B","assetid":0,"amount":"1","txtype":"xTransfer","tx":"not set","source_amount":"1"}]}}
// parse multiscenario, action node only
router.post('/info/multi', async (req, res) => {
  const scenario_id = req.body.id

  if (!scenario_id) {
    return res.json({
      result:
        "No scenario id detected, provide a request like this: curl -X ENDPOINT/scenario/info -d {'id':'my scenario id here'}",
    })
  }
  const get_data = await getUrl(scenario_id)
  if (!get_data) {
    return res.json({ result: 'Could not find the scenario data' })
  }
  const decoded = await decompressString(get_data)
  //   console.log(`decoded: `, decoded);
  const multisdaat = multi_scenario_info(JSON.parse(decoded))
  //  console.log(`multisdaat:`, multisdaat);
  //  console.log(`multisdaat done`);
  return res.json({ result: { scenarios: multisdaat } })
})

// call a scenerio - call a scenario you created in the UI - todo
router.post('/call', (req, res) => {
  const jsonData = req.body.scenarioid
  res.json({ receivedData: 'todo' })
})


/// RAMSEY SERVER


// router.post('/execute', verifyToken, async (req, res) => {
//   let executionId: any;
//   try {
//     const { diagramData, scenario } = req.body.scenarioData;
//     console.log('[/execute] body request...', req.body);

//     console.log('Workflow execution started');
  
//     // If the user is not attached, something went wrong
//     if (!req.user || !req.user._id) {
//         console.log('No user or user._id found in req:', req.user);
//         return res.status(403).json({ error: "User not authenticated" });
//     }

    
//     // Create a new Execution instance
//     const newExecution = new Execution({
//       scenario: scenario,
//       user: req.user._id, 

//     });

//     // Save it to the database
//     const savedExecution = await newExecution.save();
//     if (!savedExecution) {
//         console.error('Error saving execution to the database');
//         return res.status(500).json({ error: "Error saving execution to the database" });
//     } else {
//       console.log('Saved execution to the database', savedExecution);
//     }

//     // MongoDB will automatically generate an `_id` field
//     executionId = savedExecution._id.toString();  // Convert ObjectId to string here

//     // // Enqueue the job
//     // await executionQueue.add({
//     //     user: req.user._id,
//     //     scenario,
//     //     diagramData,
//     //     executionId,
//     //     validNodeIds: []
//     // });
  
  
//     // Immediately respond with the execution ID
//     res.json({ executionId });
//     console.log('execution id:', executionId);
//     req.io.to(executionId).emit('status', { message: 'Workflow execution started' });
//     console.log('[/execute] [after emit status] Request Body:', req.body);
//     await startScenarioExecution({ user: req.user._id, scenario, diagramData, executionId, req, validNodeIds: []  })
//   } catch (err) {
//     console.error(`Error executing the scenario: ${err.message}`);
//     if (executionId) { // Make sure executionId exists
//       req.io.to(executionId).emit('status', { message: 'Workflow execution failed', error: err.message });
//     } else {
//       // If executionId doesn't exist, you can emit to a channel that the client is listening on to handle general errors.
//       // Alternatively, log it to handle it through other means.
//     }
//   }
// });

// router.post('/createScenario', verifyToken, async (req, res) => {
//     const { initialData } = req.body;
  
//     try {
//       // Create a new Scenario in the database
//       const newScenario = await Scenario.create({ 
//         ...initialData,  
//         user: req.user._id
//       });
  
//       // Send the new MongoDB _id back to the client
//       res.status(201).json({ message: 'Scenario created successfully.', _id: newScenario._id });
//       console.log(`Scenario created successfully with ID: ${newScenario._id}`);
  
//     } catch (error) {
//       console.error('Error creating scenario:', error.message);
//       res.status(500).json({ message: 'Error creating scenario' });
//     }
//   });
  

// // Save Scenario 
// router.post('/save', verifyToken, async (req, res) => {
//     console.log('request body in /save', req.body)
//     const scenarioData  = req.body.scenarioData;
//     console.log('scenarioData is req.body in /save:', scenarioData);
  
//     const userId = req.user ? req.user._id : null;
//     console.log('userId in /save:', userId);

//     if (!userId) {
//     return res.status(403).json({ error: 'User not authenticated' });
//     }
//     console.log('scenarioData in /save:', scenarioData);
//     const scenario = await Scenario.findById(scenarioData.scenario);

//     if (!scenario) {
//     return res.status(404).json({ message: 'Scenario not found' });
//     }

//     if (String(scenario.user) !== String(userId)) {
//     return res.status(403).json({ message: 'You do not have permission to modify this scenario' });
//     }
//     console.log('Saving scenario in save:', scenarioData );
//     const success = await saveScenario({ scenarioData, userId });

//     if (success) {
//     return res.status(201).json({ message: 'Scenario saved successfully.' });
//     } else {
//     return res.status(500).json({ message: 'Error saving scenario' });
//     }
// });


// // Server-side code for fetching heavy data
// router.get('/load/:_id', verifyToken, async (req, res) => {
//     const _id = req.params._id;
//     console.log('_id:', _id);

//     const userId = req.user ? req.user._id : null;
//     console.log('userId in /save:', userId);

//     if (!userId) {
//     return res.status(403).json({ error: 'User not authenticated' });
//     }

//     console.log
//     // Fetch scenario to check if it belongs to the authenticated user
//     const scenario = await Scenario.findById(req.params._id); // 'id' would be MongoDB's auto-generated _id

//     if (!scenario) {
//         res.status(404).json({ message: 'Scenario not found' });
//         return;
//       }
  
//       if (String(scenario.user) !== String(req.user._id)) {
//         res.status(403).json({ message: 'You do not have permission to modify this scenario' });
//         return;
//       }
  
//     try {
  
//       if (!scenario) {
//         res.status(404).json({ message: 'Scenario not found' });
//         return;
//       }
  
//       // Respond with the full scenario
//       res.json(scenario);
  
//     } catch (error) {
//       console.error('Error loading scenario:', error);  // Log the error for debugging
    
//       if (error.name === 'CastError') {
//         return res.status(400).json({ error: 'Invalid ID format' });
//       }
    
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });
  

// router.get('/executionData/:executionId', verifyToken, async (req, res) => {
//     try {

//         const executionData = await Execution.find(req.params.executionId);
//         if (!executionData || executionData.length === 0) {
//             res.status(404).json({ message: 'Execution data not found' });
//             return;
//         }

//         // Check if the user making the request is the owner of the execution
//         if (String(executionData.userId) !== String(req.user._id)) {
//             res.status(403).json({ message: 'You do not have permission to view this execution' });
//             return;
//         }

//         res.json(executionData);
//     } catch (error) {
//         console.error('Error fetching execution data:', error);
//         res.status(500).json({ message: 'Error fetching execution data' });
//     }
// });

//     // Delete a specific scenario by MongoDB _id
//     router.delete('/:_id', verifyToken, async (req, res) => {
//       console.log('[deleteScenario] we are in delete scenario')
//         const _id = req.params._id;
//         console.log('[deleteScenario] the _id for the scenario:', _id);

//         const userId = req.user ? req.user._id : null;
//         console.log('userId in /delete:', userId);

//         if (!userId) {
//         return res.status(403).json({ error: 'User not authenticated' });
//         }

//         const userString = String(userId);
//         console.log('[deleteScenario] userString:', userString)
//         console.log('[deleteScenario] just before find Scenario _id:', _id)
//         // Fetch scenario to check if it belongs to the authenticated user
//         // TODO: check if the scenario is valid because a badly formed sceanrio can crash the db
//         const scenario = await Scenario.findById(_id); 
    
//         if (!scenario) {
//           console.log('[deleteScenario] scenario not found');
//             return res.status(404).json({ message: 'Scenario not found' });
//         }
    
//         if (String(scenario.user) !== String(req.user._id)) {
//             return res.status(403).json({ message: 'You do not have permission to delete this scenario' });
//         }
    
//         try {
//           console.log('[deleteScenario] just before deleteOne', _id);
//           await Scenario.deleteOne({ _id: _id });
//           console.log('[deleteScenario] just after deleteOne', _id);

//           // Update user metadata
//           const response = await UserMetadata.updateOne(
//             { user: userString },
//             { $pull: { scenarios: { scenario: _id } } }
//           );
//           if (response) {
//             console.log('User metadata updated successfully');
//           } else {
//             console.error('Error updating user metadata');
//           }

//           res.status(200).json({ message: 'Scenario deleted successfully' });
//         } catch (error) {
//           console.error('Error deleting scenario:', error);
//           res.status(500).json({ message: 'Error deleting scenario' });
//         }
//     });
  
//   // Delete a specific execution by executionId
//   router.delete('/execution/:executionId', verifyToken, async (req, res) => {
//     const executionId = req.params.executionId;

//       // Fetch scenario to check if it belongs to the authenticated user
//       const execution = await Execution.findById(executionId);

//       if (!execution) {
//         res.status(404).json({ message: 'Execution not found' });
//         return;
//       }
  
//       if (String(execution.user) !== String(req.user._id)) {
//         res.status(403).json({ message: 'You do not have permission to modify this execution' });
//         return;
//       }
//     try {
//       await Execution.deleteOne({ _id: executionId });
//       res.status(200).json({ message: 'Execution deleted successfully' });
//       console.log('Execution deleted successfully');
//     } catch (error) {
//       console.error('Error deleting execution:', error);
//       res.status(500).json({ message: 'Error deleting execution' });
//     }
//   });

// router.post('/stopExecution', verifyToken, async (req, res) => {
//     const { executionId } = req.body;

//         console.log('Finding execution with id:', executionId)
//         // Fetch scenario to check if it belongs to the authenticated user
//         const execution = await Execution.findById(executionId);

//         if (!execution) {
//         res.status(404).json({ message: 'Execution not found' });
//         return;
//         }
    
//         if (String(execution.user) !== String(req.user._id)) {
//         res.status(403).json({ message: 'You do not have permission to modify this execution' });
//         return;
//         }

//     if (!executionId) {
//         return res.status(400).json({ message: 'executionId is required' });
//     }

//     try {
//         const result = await ExecutionLog.updateMany({ execution: executionId }, { execution_status: 'stopped' });
//         console.log('Updated records:', result);  // Log the result to check how many records got updated
//         res.json({ message: 'Execution status updated to stopped' });
//     } catch (error) {
//         console.error('Error stopping the execution:', error);
//         res.status(500).json({ message: 'Error stopping the execution' });
//     }
// });







export default router
