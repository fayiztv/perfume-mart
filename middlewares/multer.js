const multer = require('multer')


let storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'public/product-images')
    },
    filename:function(req,file,cb){
        const uniqueSuffix = Date.now()+'-'+Math.round(Math.random()* 1E9)
        cb(null,file.filename + '-' + uniqueSuffix)
    }
})

let upload = multer({storage:storage})

module.exports = upload