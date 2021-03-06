const {Router} = require('express');
const config = require('config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator');
const User = require("../models/User");

const router = Router();

// api/auth/signup
router.post(
    '/signup',
    [
        check('email', 'Uncorrect email!').isEmail(),
        check('password' , 'Min-length 6 symbols').isLength({min: 6}),
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors : errors.array(),
                message : 'Uncorrect data for register!'

            })
        }

        const {email, password} = req.body;

        const candidate = await User.findOne({email});

        if (candidate) {
            return res.status(400).json({ message : "This user already exists!"})
        }
        else {
            const hashedPassword = await bcrypt.hash(password, 12);

            const user = new User({email, password : hashedPassword})

            await user.save()

            res.status(201).json({ message : 'User has been created successfully!'})
        }
    }
    catch (error) {
        res.status(500).json({ message : "Something went wrong, try again!"})
    }
});

// /api/auth/signin
router.post(
    '/signin',
    [
      check('email', 'Enter correct email!').normalizeEmail().isEmail(),
      check('password', 'Enter password!').exists()
    ],
    async (req, res) => {
    try {
      const errors = validationResult(req)
  
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Uncorrect data for signing up'
        })
      }
  
      const {email, password} = req.body
  
      const user = await User.findOne({ email })
  
      if (!user) {
        return res.status(400).json({ message: 'User does not exist!' })
      }
  
      const isMatch = await bcrypt.compare(password, user.password)
  
      if (!isMatch) {
        return res.status(400).json({ message: 'Password is uncorrect, please, try again!' })
      }
  
      const token = jwt.sign(
        { userId: user.id },
        config.get('jwtSecret'),
        { expiresIn: '1h' }
      )
  
      res.json({ token, userId: user.id })
  
    } catch (e) {
      res.status(500).json({ message: 'Something went wrong, try again!' })
    }
  }
)

module.exports = router;