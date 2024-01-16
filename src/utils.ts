import { Request, Response } from 'express';
import fetch from 'node-fetch';



export async function createWebhook(req: Request, res: Response): Promise<any> {
    
    // Run the middleware
    console.log('createWebhook running middleware...');
  
    const apiKey: string | undefined = process.env.WEBHOOK_SITE_API_KEY;
  
    if (!apiKey) {
      return res.status(500).json({ error: 'webhook.site API key not configured' });
    }
  
    try {
      console.log('createWebhook Creating webhook...');
      const webhookEndpoint: string = 'https://webhook.site/token';
  
      const response = await fetch(webhookEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        // include body if required
      });
  
      console.log('Response Status:', response.status);
      const rawResponse: string = await response.text();
      console.log('Raw Response:', rawResponse);
  
      if (!response.ok) {
        throw new Error(`Error from Webhook.site: ${response.statusText}`);
      }
  
      const webhookData = JSON.parse(rawResponse);
      res.status(200).json({ uuid: webhookData.uuid });
    } catch (error) {
      console.error('Error creating webhook:', error);
      res.status(500).json({ error: error.message });
    }
  }