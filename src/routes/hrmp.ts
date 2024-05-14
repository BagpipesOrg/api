import { Router } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import { inandoutchannels } from '../api/xcmhelper'

dotenv.config();
const router = Router();


// todo add kusamas
// open channels, list open ingoing and outgoing hrmp channels for paraid
router.post('/polkadot/openchannels', async (req, res) => {
  const paraid = req.body.paraid // get the chains paraid
  if (typeof paraid !== 'number' || paraid < 0 || paraid > 10000) {
    return res.status(400).json({ error: 'Invalid paraid. It must be a number between 0 and 10000.' })
  }
  const channels = await inandoutchannels(paraid)
  res.json({ open_hrmp_channels: channels, sourcechain: paraid })
})


  export default router;