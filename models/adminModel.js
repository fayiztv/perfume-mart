const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({

    // we are creating a schema for what are we want in our admin form 

    name:{
        type:String,
        required:true 
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }

})

const adminModel = mongoose.model('admins',adminSchema) //creating a collection with the schema we created above

module.exports = adminModel