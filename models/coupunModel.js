

const mongoose  = require('mongoose')
const coupunSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },

    code:{
        type:String,
        required:true
    },

    minAmount:{
        type:String,
        required:true
    },

    cashBack:{
        type:String,
        required:true
    },

    expiry:{
        type:Date,
        required:true
    },

    status:{
        type:String,
        default:'available'
    }
})

const coupunModel = mongoose.model("coupun", coupunSchema) 
module.exports = coupunModel