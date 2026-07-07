const express = require('express');
const router = express.Router();

const {protect, admin} = require('../middleware/auth');
// const { sendBookingEmail } = require('../utils/email');
const {bookEvent,sendBookingOTP,getMyBooking,confirmBooking,cancelBooking} = require('../controllers/bookingController')

router.post('/',protect,bookEvent);
router.post('/send-otp',protect,sendBookingOTP);
router.get('/my',protect,getMyBooking);
router.put('/:id/confirm',protect,admin,confirmBooking);
router.delete('/:id',protect,cancelBooking)

module.exports=router;