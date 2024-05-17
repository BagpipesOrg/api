import { Router } from 'express'
import dotenv from 'dotenv'
import axios from 'axios'
dotenv.config()
const router = Router()

router.get('/testWebhook', async (req, res) => {
  // Mock webhook event data
  const mockEvent = {
    id: 'event123',
    type: 'webhook_test',
    payload: { message: 'This is a test webhook event' },
  }

  // Sending a POST request to the webhook receiver endpoint
  try {
    const response = await axios.post(
      `http://localhost:${process.env.PORT}/api/webhook/receiveWebhookEvents`,
      mockEvent,
    )
    res.status(200).json({ message: 'Test webhook sent successfully', response: response.data })
  } catch (error) {
    res.status(500).json({ message: 'Error sending test webhook', error: error.message })
  }
})

export default router
