
const mongoose = require('mongoose')

function connectDB(){
    mongoose.set('strictQuery',false)
    mongoose.connect("mongodb://127.0.0.1:27017/pilloMart").then(result=>{
        console.log("database connected")
    }).catch((err)=>{
        console.log("data base error" +err) 
    })
}

module.exports=connectDB                                                                           