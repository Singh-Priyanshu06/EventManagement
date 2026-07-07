const Event = require('../models/Event');
const { findById, findByIdAndUpdate } = require('../models/OTP');


const getAllEvents = async(req,res)=>{
     try {
        const filters = {};
        if (req.query.category) filters.category = req.query.category;
        if (req.query.search) filters.title = { $regex: req.query.search, $options: 'i' };

        const events = await Event.find(filters).populate('createdBy', 'name email');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}


const getEventById = async(req,res)=>{
    try{
     const event = await Event.findById(req.params.id);
     if(!event){
        res.status(401).json({message:"Event Not Found"})
     }else{
        res.json(event)
     }
    }catch(error){
        res.status(500).json({error: error.message});
    }
}


const createEvent = async(req,res)=>{
    const{title,description,date,location,category,totalSeats,ticketPrice,image}  = req.body;
    try{
        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            availableSeats: totalSeats,
            ticketPrice: ticketPrice || 0,
            image: image || '',
            createdBy: req.user.id
        });
        res.status(201).json(event);
    }catch (error){
        res.status(500).json({error:error.message});
    }
}

const updateEvent = async(req,res)=>{
     const{title,description,date,location,category,totalSeats,ticketPrice,imageUrl}  = req.body;
     try{
        const event = await findByIdAndUpdate(req.params.id, req.body,{new:true});
        if(!event){
            res.status(401).json({error:'Event not found'});

        }
        res.json(event);

        }catch(error){
            res.status(500).json({error: error.message});
        }
     };


const deleteEvent = async(req,res)=>{
    try{
        const event = await Event.findByIdAndDelete(req.params.id);
        if(!event){
            return res.status(404).json({message:'Event Not Found!'})
        }
        res.status(201).json({message:'Event Delete SuccessFully'})
    }catch(error){
            res.status(500).json({error: error.message});
        }
};


module.exports = {getAllEvents,getEventById,createEvent,updateEvent,deleteEvent}