const express = require("express");
const router = express.Router();
const {register,loginUser,verifyOtp} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp)


module.exports = router;
