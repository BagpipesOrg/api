import { Router } from 'express'
import dotenv from 'dotenv'
import axios from 'axios'

import { saveUrl, getUrl } from '../api/handledb'

dotenv.config()
const router = Router()

// Save Scenario
//router.post('/save', verifyToken, async (req, res) => {

// save data and generate storage key/short url key
router.post('/saveUrl', async (req, res) => {
  console.log(`saveUrl`)
  const longUrl = req.body
  //console.log(`Saving `, longUrl);
  try {
    // console.log(`saving it`);
    const shortUrl = await saveUrl(longUrl)
    //  console.log(`after save shortUrl:`, shortUrl);
    res.json({ success: true, shortUrl })
  } catch (error) {
    console.error('Error saving URL:', error)
    res.status(500).json({ success: false, error: 'Internal Server Error' })
  }
})

router.get('/', async (req, res) => {
  res.json({ success: true, documentation: 'https://xcmsend.github.io/api/index.html' })
})

// Get URL
router.get('/getUrl/:shortUrl', async (req, res) => {
  const { shortUrl }: { shortUrl: string } = req.params
  // console.log(`geturl`);
  try {
    const longUrl = await getUrl(shortUrl)
    //   console.log(`getUrl: `, shortUrl);
    res.json({ success: true, longUrl })
  } catch (error) {
    console.error('Error getting URL:', error)
    res.status(500).json({ success: false, error: 'Internal Server Error' })
  }
})


/*

// use template - todo
router.post('/call', (req, res) => {
  const jsonData = req.body.scenarioid
  res.json({ receivedData: 'todo' })
})

*/

export default router
