import { Router } from 'express'
import dotenv from 'dotenv'
import axios from 'axios'

import { create_swap } from '../scenarios/parse_db'
import { generic_system_remark } from '../api/DraftTx'
import { route_tx } from './../api/txroute'

import { executeChainQueryMethod } from "../api/query"

dotenv.config()
const router = Router()

import bodyParser from 'body-parser';

router.use(bodyParser.json());



// xcm asset transfer
// call a scenerio - call a scenario you created in the UI - todo
router.post('/xcm-asset-transfer', async (req, res) => {
  console.log(`xcm-asset-transfer`)
  console.log(req.body)
  try {
    console.log(`s0`)
    const sourchain = req.body.sourchain
    console.log(`sourcechain:`, sourchain)
    const destchain = req.body.destchain
    console.log(`destchain:`, destchain)
    const assetid = req.body.assetid
    console.log(`assetid:`, assetid)
    const amount = req.body.amount
    console.log(`amount:`, amount)
    const destinationaddress = req.body.destinationaddress
    console.log(`destinationaddress:`, destinationaddress)
    console.log(`route_tx start`)
    const tx = await route_tx(sourchain, destchain, assetid, amount, destinationaddress)
    console.log(`tx route_tx`)
    res.json({ txdata: tx })
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' })
  }
})

router.post('/polkadot/xcm-native-transfer', (req, res) => {
  const jsonData = req.body.scenarioid
  res.json({ receivedData: 'todo' })
})

router.post('/swap/create', async (req, res) => {
  console.log(`create swap called`)
  console.log(`create swap: `, req.body)
  try {
    console.log(`output: `, req.body.assetin, req.body.assetout, req.body.amount)

    const assetin: number = parseInt(req.body.assetin, 10)
    const assetout: number = parseInt(req.body.assetout, 10)
    const amount: number = parseInt(req.body.amount, 10)

    if (
      typeof assetin !== 'number' ||
      typeof assetout !== 'number' ||
      typeof amount !== 'number' ||
      isNaN(assetin) ||
      isNaN(assetout) ||
      isNaN(amount)
    ) {
      return res
        .status(400)
        .json({ error: 'Missing required fields, view documentation: https://xcmsend.github.io/api/docs.html' })
    }

    console.log(`pling plong`)

    // Validate that the parsed values are valid numbers
    if (isNaN(assetin) || isNaN(assetout) || isNaN(amount)) {
      return res.status(400).json({ error: 'submit assetid, amount and assetout as numbers ' })
    }

    const out = await create_swap(assetin, assetout, amount)
    res.status(200).json({ success: true, swap: out })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Internal Server Error, reach fellow developers on bagpipes discord: https://discord.gg/ZBfmzJ7Jjz',
    })
  }
})

// curl -X POST -H "Content-Type: application/json" -d '{"chain": "polkadot", "msg": "hack the planet"}' http://localhost:8080/system-remark
router.post('/system-remark', async (req, res) => {
  const chain: string = req.body.chain
  const msg: string = req.body.msg
  const chains = ['turing', 'moonriver', 'mangatax', 'assetHub', 'interlay', 'hydraDx', 'polkadot']
  if (!chains.includes(chain)) {
    return res.json({
      error: 'invalid chain, select one of: turing, moonriver, mangatax, assetHub, interlay, hydraDx, polkadot',
    })
  }
  console.log(`making system remark with: `, chain, msg)
  const tx = (await generic_system_remark(chain, msg)).toHex()
  res.json({ result: tx })
})

// Query Chain  | chainKey, palletName, methodName, params, atBlock
// curl -X POST -d '{"chain": "polkadot", "pallet_name": "timestamp", "method_name": "", "params", "block": ""}'
router.post('/query', async (req, res) => {
  const chain: string = req.body.chain
  const pallet_name: string = req.body.pallet_name
  const method_name: string = req.body.method_name
  const block: string = req.body.block
const params: any[] = req.body.params
  console.log(`Query request: `, req.body)
  console.log(`input: `, chain, pallet_name, method_name, block, params)

  try {
  const tx = (await executeChainQueryMethod(chain, pallet_name, method_name, params, block)).toHex();
  
  return res.json({result: tx})
} catch (error) {
  return res.json("Error")
}

})




export default router
