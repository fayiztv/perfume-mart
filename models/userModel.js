



const mongoose = require('mongoose')
const { array } = require('../middlewares/multer')

const userSchema = new mongoose.Schema({

    name:{    
        type:String,
        required:true   
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String, 
    },
    status:{
        type:String,
        default:"unblock" 
    },
    address:{
        type:Array,
        default:[]
    },
    cart:{
        type:Array,
        default:[]
    },
    wishlist:{
        type:Array,
        default:[]
    },
    

}) 

const userModel = mongoose.model('users',userSchema)

module.exports=userModel