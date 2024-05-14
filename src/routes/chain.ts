import { Router } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

import { broadcastToChain } from '../api/broadcast'


dotenv.config();
const router = Router();



// tx broadcast
// /broadcast input: {chain: 'hydradx', tx: ''}
router.post('/broadcast', async (req, res) => {
  const chain = req.body.chain
  const txdata = req.body.tx // get the chains paraid
  if (chain !== 'polkadot' && chain !== 'hydraDx' && chain !== 'assetHub') {
    return res.status(400).json({ error: 'Invalid chain. Select polkadot/hydraDx/assetHub' })
  }

  //if (typeof txdata !== 'string' || txdata.length > 1) {
  //  return res.status(400).json({ error: 'Invalid txdata.' });
  //}

  try {
    const myhash = await broadcastToChain(chain, txdata)
    //   console.log(`myhash:`, myhash.toString());
    res.json({ status: 'broadcasted', hash: myhash })
  } catch (error) {
    console.error('Error while broadcasting to the chain:', error)
    res.status(500).json({ error: 'An error occurred while broadcasting to the chain.' })
  }
})

  export default router;