import { Router, Request, Response } from 'express';
import UserMetadata from '../models/UserMetadata'; // Assuming UserMetadata.ts exports a TypeScript type
import verifyToken from '../services/verifyToken'; // Assuming verifyToken.ts uses proper TypeScript typing

const router = Router();

interface CustomRequest extends Request {
  user?: { _id: string }; // Assuming the user object has an _id of type string
}

// Fetch User Metadata
router.get('/', verifyToken, async (req: CustomRequest, res: Response) => {
    const userId = req.user ? req.user._id : null;
  
    if (!userId) {
      return res.status(403).json({ error: 'User not authenticated' });
    }
  
    try {
      const userMetadata = await UserMetadata.findOne({ user: userId });
      if (!userMetadata) {
        return res.status(404).json({ message: 'Metadata not found' });
      }
      return res.status(200).json(userMetadata);
    } catch (error) {
      console.error("Error fetching user metadata:", error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
