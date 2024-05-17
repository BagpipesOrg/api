//api/createWebhook.js
import { Router } from 'express'
import dotenv from 'dotenv'
import axios from 'axios'
dotenv.config()
const router = Router()

router.post('/create', async (req, res) => {
  res.json({ result: 'function coming soon' })
})

router.post('/createWebhook', async (req, res) => {
  // res.setHeader('Access-Control-Allow-Credentials', true)
  // res.setHeader('Access-Control-Allow-Origin', '*')
  // // another common pattern
  // // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  // res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  // res.setHeader(
  //   'Access-Control-Allow-Headers',
  //   'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  // )

  // if (req.method === 'OPTIONS') {
  //   res.status(200).end()
  //   return
  // }
  // Run the middleware
  console.log('createWebhook running midleware...')

  const apiKey = process.env.WEBHOOK_SITE_API_KEY
  console.log('createWebhook API Key:', apiKey)

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    console.log('createWebhook Creating webhook...')
    const webhookEndpoint = 'https://webhook.site/token'

    const response = await fetch(webhookEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      // include body if required
    })

    console.log('Response Status:', response.status)
    const rawResponse = await response.text()
    console.log('Raw Response:', rawResponse)

    if (!response.ok) {
      throw new Error(`Error from Webhook.site: ${response.statusText}`)
    }

    const webhookData = JSON.parse(rawResponse)
    res.status(200).json({ uuid: webhookData.uuid })
  } catch (error) {
    console.error('Error creating webhook:', error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/forwardToWebhookSite', async (req, res) => {
  const webhookSiteUUID = req.body.uuid // UUID passed from the frontend
  const webhookSiteApiKey = process.env.WEBHOOK_SITE_API_KEY // API key from .env

  try {
    await axios.post(`https://webhook.site/${webhookSiteUUID}`, req.body.data, {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': webhookSiteApiKey,
      },
    })
    res.status(200).json({ message: 'Data forwarded to Webhook.site successfully' })
  } catch (error) {
    console.error('Error forwarding to Webhook.site:', error)
    res.status(500).json({ message: 'Error forwarding data', error: error.message })
  }
})

let webhookEvents = [] // Simple in-memory array to store events

router.post('/receiveWebhookEvents', async (req, res) => {
  console.log('Received webhook data:', req.body)
  webhookEvents.push(req.body) // Store the event
  res.status(200).json({ message: 'Webhook data received successfully' })
})

router.get('/webhookEvents', async (req, res) => {
  res.status(200).json(webhookEvents) // Return stored events
})
export default router

router.get('/fetchWebhookData/:uuid', async (req, res) => {
  const token_id = req.params.uuid
  console.log('fetchWebhookData token_id:', token_id)
  const webhookSiteApiKey = process.env.WEBHOOK_SITE_API_KEY

  try {
    const response = await axios.get(`https://webhook.site/token/${token_id}/requests`, {
      headers: {
        Accept: 'application/json',
        'Api-Key': webhookSiteApiKey,
      },
    })
    console.log('Response from Webhook.site:', response.data)
    res.status(200).json(response.data)
  } catch (error) {
    console.error('Error fetching data from Webhook.site:', error)
    res.status(500).json({ message: 'Error fetching data', error: error.message })
  }
})
