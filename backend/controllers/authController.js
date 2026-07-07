const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require('bcrypt');
const { sendOTPEmail } = require("../utils/email");
const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
   
};

const register = async(req,res) =>{
    try{
        const {name,email,password,role} = req.body;

        const userExist = await User.findOne({email});

        if(userExist){
            return res.status(400).json({error: "User already exists"});
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const user = await User.create({name,email,password:hashedPassword,roler:"user",isVerify:false})
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`OTP for ${email}: ${otp}`);
        await OTP.create({ email, otp, action: 'account_verification' });
        await sendOTPEmail(email,otp,'account_verication');

        res.status(201).json({message:"User registered successfully", email: user.email}); 

    }catch (error) {
        res.status(400).json({error: error.message});
    }
}

const loginUser = async (req,res)=>{
    try{
        const {email,password}= req.body;

        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"Invalid email"});
        }
        
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
             return res.status(400).json({error:"Invalid password"});
        }

        if(!user.isVerified && user.role === 'user'){
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await OTP.deleteMany({email, action:"account_verification"});
            await sendOTPEmail(email,otp,'account_verification');
            return res.status(400).json({error:'Account not verified. A new OTP has been sent to your email.'});
        }

        res.json({
            message: 'Login successful',
            _id : user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id,user.role)
        });
       
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

const verifyOtp = async(req,res)=>{
    try{
    const {email,opt}= req.body;
    const validOTP= await OTP.findOne({email,opt,action:'account_verification'})

    if(!validOTP){
        return res.status(400).json({error:'Invalid or expired OTP'});
    }

    const user = await User.findOneAndUpdate({email},{isVerified:true});
    await OTP.deleteOne({ _id: validOTP._id }); // Delete OTP after usage

    res.json(
        {
            message:'Account verified Successfully. You con now log in.',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id,user.role)
    });
}catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = { register, loginUser, verifyOtp };
