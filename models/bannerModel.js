const mongoose=require('mongoose')
const {array} = require('../middlewares/multer')

const bannerSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:Object,
        required:true
    },
    description:{
        type:String
    },
    status:{
        type:String,
        default:'available'
    }
})

const bannerModel=mongoose.model('banner',bannerSchema)

module.exports=bannerModel