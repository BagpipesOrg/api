//api/createWebhook.js
import { Router } from 'express'
import dotenv from 'dotenv'
import axios from 'axios'
dotenv.config()
const router = Router()

router.post('/executeHttpRequest', async (req, res) => {
  console.log('Received HTTP request:', req.body)
  try {
    const formData = req.body
    console.log('Received formData for HTTP request:', formData)
    const { url, method, headers = {}, requestContent = {} } = formData

    // Use the value as the request body directly
    let requestBody = { requestContent }

    // Transform headers from array to object
    let formattedHeaders = headers.reduce((acc: { [x: string]: any }, header: { key: string | number; value: any }) => {
      if (header.key && header.value) {
        // Ensure that key and value are present
        acc[header.key] = header.value
      }
      return acc
    }, {})

    console.log('Formatted headers:', formattedHeaders)

    const httParams = {
      method,
      url,
      headers: formattedHeaders,
      // body: requestBody,
      data: requestBody,
    }

    console.log('HTTP request params:', httParams)
    // Execute the HTTP request with Axios
    const response = await axios(httParams)

    // Log the part of the response you're interested in, for debugging
    console.log('HTTP request successful, status:', response.status)

    // Respond with relevant parts of the Axios response
    res.json({
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  } catch (error) {
    console.error('Failed to execute HTTP request:', error)
    // Send a simplified error response
    res.status(500).send({ message: 'Failed to execute HTTP request', details: error.message })
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
  const webhookSiteUUID = req.params.uuid
  const webhookSiteApiKey = process.env.WEBHOOK_SITE_API_KEY

  try {
    const response = await axios.get(`https://webhook.site/token/${webhookSiteUUID}/requests`, {
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
