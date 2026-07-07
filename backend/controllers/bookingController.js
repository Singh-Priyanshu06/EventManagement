const Booking = require('../models/Bookings')
const OTP = require('../models/OTP');
const Event = require('../models/Event');
const { sendOTPEmail, sendBookingEmail } = require('../utils/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendBookingOTP = async(req,res)=>{
    const otp = generateOTP();
    await OTP.findOneAndDelete({email:req.user.email, action:'event_booking'})
    await OTP.create({email:req.user.email, otp:otp, action:'event_booking'})
    await sendOTPEmail(req.user.email,otp,'event_booking');
    res.json({message:'OTP send to email'});
}

const bookEvent = async (req, res) => {
    try {
        const { eventId, otp } = req.body;

        // Verify OTP explicitly before proceeding
        const validOTP = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });
        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP for booking' });
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.availableSeats <= 0) return res.status(400).json({ message: 'No seats available' });

        const existingBooking = await Booking.findOne({ userId: req.user.id, eventId });
        if (existingBooking && existingBooking.status !== 'cancelled') {
            return res.status(400).json({ message: 'Already booked or pending' });
        }

        const booking = await Booking.create({
            userId: req.user.id,
            eventId,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: event.ticketPrice
        });
        await OTP.deleteOne({ _id: validOTP._id }); // cleanup
        res.status(201).json({ message: 'Booking request submitted', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const confirmBooking = async (req,res)=>{
    const paymentStatus = req.body.paymentStatus;
    if(!['paid','non_paid'].includes(paymentStatus)){
        return res.status(400).json({error:'Invalid payment status'});
    }
    const booking = await Booking.findById(req.params.id).populate('eventId');
    if(!booking){
        return res.status(400).json({error:'Booking not found'});
    }
    if(booking.status === 'confirmed'){
        return res.status(400).json({error:'Booking is already confirmed'});
    }

    const event = await Event.findById(booking.eventId._id);
    if(event.totalSeats <= 0){
        return res.status(400).json({error:'No seats available'});
    }

    booking.status =  'confirmed';

    if(paymentStatus){
        booking.paymentStatus = paymentStatus;
    }
    await booking.save();
    event.totalSeats -= 1;
    await event.save();

    //admin confirmed booking then send email to user
    await sendBookingEmail(req.user.email, event.title, booking._id);

    res.json({message:'Booking confirmed'});
}   

const getMyBooking = async(req,res)=>{
     try {
        const bookings = req.user.role === 'admin'
            ? await Booking.find().populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 })
            : await Booking.find({ userId: req.user.id }).populate('eventId').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const cancelBooking = async(req,res)=>{
    const booking = await Booking.findById(req.params.id).populate('eventId');
    if(!booking){
        return res.status(404).json({error:'Booking not found'});
    }
    if(booking.userId.toString() !== req.user._id.toString()){
        return res.status(403).json({error:'Unauthorized'});
    }

    booking.status = 'cancelled';
    await booking.save();

    if(booking.status === 'confirmed'){
        const event = await Event.findById(booking.eventId._id);
        event.totalSeats += 1;
        await event.save();
    }

    await booking.remove();
    res.json({message:'Booking cancelled'});
}

module.exports = {sendBookingOTP,bookEvent,confirmBooking,getMyBooking,cancelBooking}