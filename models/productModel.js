


const mongoose = require('mongoose')
const {array} = require('../middlewares/multer')

const productSchema = new mongoose.Schema({

    name:{
        type:String, 
        required:true
    },
    category:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    mrp:{
        type:Number
    },
    brand:{
        type:String
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    mainImage:{
        type:Object,
        require:true
    },
    sideImage:{
        type:Array,
        required:true 
    },
    ratings:{
        type:Array, 
        default:[]
    },
    status:{
        type:String,
        default:'available'
    }

})

const productModel = mongoose.model('product',productSchema)
module.exports = productModel