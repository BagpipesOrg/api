import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import logger from '../logger';
import User from '../models/User';
import { registerValidation, loginValidation } from '../validation/validation';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import verifyToken from '../services/verifyToken';
dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: { _id: string };  // This assumes your verifyToken middleware adds an object with at least _id
}
interface SettingsRequest extends AuthenticatedRequest {
  body: {
    email?: string;
    newPassword?: string;
  };
}

interface ResetPasswordRequest extends Request {
  body: {
    newPassword: string;
    resetToken: string;
  };
}

interface IsAuthRequest extends Request {
  isAuthenticated?: boolean;
}


let transporter = nodemailer.createTransport({
  service: 'gmail',  // this is an example with Gmail, but you can use other services
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

const router = Router();

const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:5173' : 'https://alpha.bagpipes.io';


function getFriendlyErrorMessage(error: Error) {
  switch (error.message) {
    case 'Email already exists.':
      return 'This email is already registered. Please try to log in instead.';
    default:
      return 'An unexpected error occurred. Please try again later.';
  }
}




router.post('/register', async (req, res) => {
  // Log the request body
  console.log('[/register] Request Body :', req.body);

  //validate the data that the users inputs 
  const {error} = registerValidation(req.body); 
  if(error) {
    console.log('Validation Error:', error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }

  // Check if the user is already in the database 
  const emailExist = await User.findOne({ email: req.body.email });
  if(emailExist) {
    const friendlyError = getFriendlyErrorMessage(new Error('Email already exists.'));
    console.log('Registration Error:', friendlyError);
    return res.status(400).send(friendlyError);
  }

  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  let user: any;
  try {
    // Create a new user
    user = new User({
      email: req.body.email,
      password: hashedPassword,
    });

    // Create a token for user
    // const accessToken = jwt.sign({_id: user._id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
    // const refreshToken = jwt.sign({_id: user._id}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    const accessToken = jwt.sign({_id: user._id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' }); // 2 minutes
    const refreshToken = jwt.sign({_id: user._id}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '5m' }); // 5 minutes

    // FOR PRODUCTION
    // // Set HttpOnly cookies
    // res.cookie('accessToken', accessToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production', // only transfer cookie over https
    //   sameSite: 'strict'
    // });
    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict'
    // });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', // Set to true in production
      domain: 'http://localhost:5173',
      path: '/',
    });
    res.cookie('refreshToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', // Set to true in production
      domain: 'http://localhost:5173',
      path: '/',
    });
    res.cookie('user', user._id, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      domain: 'http://localhost:5173',
      path: '/',
    });

    // Save the new user to the MongoDB database
    await user.save();
    console.log('New user registered:', user.email);

    // Send back just user id
    res.send({partner_id: user._id, master_token: accessToken});
    console.log('New user registered:', user._id);
  } catch(err) {
    console.log('Registration Error:', err.message); // Log the error message
    res.status(400).send(err);
  }

    // After creating the user and before sending the response...
  const emailToken = jwt.sign({ userId: user._id }, process.env.EMAIL_SECRET, { expiresIn: '1d' });
  const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  // Encode the token in a URI friendly way
  const encodedToken = Buffer.from(emailToken).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const url = `${BASE_URL}/confirmation/${encodedToken}`; // replace with your server URL

  // Use your email transport to send the verification email
  transporter.sendMail({
    to: user.email,
    subject: 'Verify Email',
    html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
  }, (err, info) => {
    if (err) {
      console.log(err);  // Log the email sending error
      return res.status(500).send(err);
    } else {
      // Send back just user id and accessToken
      res.send({ userId: user._id, accessToken: accessToken, emailInfo: info });    }
  });

});
  

  // Email confirmation route
  router.post('/confirmation', async (req, res) => {
    // Extract the encoded token from the request body
    const { encodedConfirmationToken } = req.body;
  
    // Convert the encoded token back into its original form
    const safeEncodedToken = encodedConfirmationToken.replace(/-/g, '+').replace(/_/g, '/');
    const confirmationToken = Buffer.from(safeEncodedToken, 'base64').toString();
  
    try {
      const { userId } = jwt.verify(confirmationToken, process.env.EMAIL_SECRET) as JwtPayload;
      await User.findByIdAndUpdate(userId, { isEmailVerified: true });
      res.send({ message: 'Email verified!' });
    } catch (e) {
      console.log(e); // Log the error message
      res.status(500).json({error: e.message});
    }
   
  });
  

  //Login
  router.post('/login', async (req, res) => {
    console.log('about to search db for', req.body.user);
    const user = await User.findOne({ email: req.body.email });
  
    if (!user) {
      return res.status(404).send('Email not found');
    }
  
    try {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });
        const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  
        // Store the refresh token in the database
        user.refreshToken = refreshToken;
        await user.save();
  
        // Send tokens as HttpOnly cookies
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // only transfer cookie over https
          sameSite: 'strict' // or 'none' or 'lax'
        });
        
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict' // or 'none' or 'lax'
        });

        res.status(200).json({ message: "Login successfull" });
      } else {
        res.status(401).json({ error: 'Incorrect password' });
      }
    } catch (error) {
      res.status(500).send();
    }
  });

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3 // limit each IP to 3 requests per windowMs
  });


  router.post('/token', apiLimiter, (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        console.log("Failed to verify refresh token: ", err);
        logger.error("Invalid token attempt:", refreshToken); 
        return res.sendStatus(403);
      }
  
      const accessToken = jwt.sign({_id: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
      res.json({accessToken});
    });
  });

  // router.get('/csrf-token', (req, res) => {
  //   console.log('csrfToken:', req.csrfToken);

  //   const csrfToken = req.csrfToken(); // Assuming you're using a middleware that sets req.csrfToken()
  //   console.log('csrfToken:', csrfToken);
  //   if (!csrfToken) {
  //     return res.status(500).json({ error: 'Could not generate CSRF token' });
  //   }
  //   res.json({ csrfToken });
  // });


  

  router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(400).json({ error: 'No user exists with this email.' });
    }
    const resetToken = jwt.sign({ _id: user.id }, process.env.RESET_TOKEN_SECRET, { expiresIn: '1h' });
    const encodedToken = Buffer.from(resetToken).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    console.log('encodedToken:', encodedToken);


    let mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: user.email,
        subject: 'Password Reset from OrgsAI',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
${BASE_URL}/reset-password/${encodedToken}\n\n
If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        res.json({ message: 'Password reset email sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error sending email.' });
    }
});

router.post('/reset-password', async (req: ResetPasswordRequest, res: Response) => {
  const { newPassword, resetToken } = req.body;  // resetToken is a JWT here, not a base64 string
  try {
      const decodedToken = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET) as JwtPayload;   // typecast decodedToken to JwtPayload
      const user = await User.findById(decodedToken._id);
      if (!user) {
        return res.status(400).json({ error: 'Invalid reset token.' });
      }
      user.password = bcrypt.hashSync(newPassword, 10);
      res.json({ message: 'Password updated successfully.' });
      console.log(user, 'updated their password');
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error resetting password.' });
  }
});

router.put('/settings', async (req: SettingsRequest, res: Response) => {
  // extract new settings from request body
  const { email, newPassword } = req.body;

  // validate email and password
  if (!email && !newPassword) {
    return res.status(400).json({ error: 'Email or password is required.' });
  }

  // find the user
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (email) {
    // check if new email is already in use
    const emailInUse = await User.findOne({ email: email });
    if (emailInUse) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }
    // update the user's email
    user.email = email;
  }


  if (newPassword) {
    // update the user's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
  }

  await user.save();

  // respond with success
  res.json({ message: 'Settings updated successfully.' });
});

router.get('/is-authenticated', async (req: IsAuthRequest, res: Response) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(400).json({ isAuthenticated: false, error: 'No Token' });  // Added status and error field
  }

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return res.json({ isAuthenticated: true });
  } catch (error) {
    return res.json({ isAuthenticated: false });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).send("Logged out");
});


router.get('/currentUser', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); 
    if (!user) throw new Error('User not found');
    res.json(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});




export default router
