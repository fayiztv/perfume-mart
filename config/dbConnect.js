
const mongoose = require('mongoose')
require('dotenv').config()
function connectDB(){
    mongoose.set('strictQuery',false)
    mongoose.connect(process.env.DB_CONFIG).then(result=>{
        console.log("database connected")
    }).catch((err)=>{
        console.log("data base error" +err) 
    })
}

module.exports=connectDB                                                                           