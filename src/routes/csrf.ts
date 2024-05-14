import { Request, Response, Router } from 'express';

// Extend Request interface for TypeScript
declare global {
  namespace Express {
    interface Request {
      csrfToken(): string;
    }
  }
}

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const csrfToken = req.csrfToken();
  console.log('csrfToken:', csrfToken);
  if (!csrfToken) {
    return res.status(500).json({ error: 'Could not generate CSRF token' });
  }
  res.json({ csrfToken });
});

export default router;
