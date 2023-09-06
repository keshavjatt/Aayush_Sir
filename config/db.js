const mongoose = require('mongoose')

let connection = async() => {
  mongoose.connect("mongodb://127.0.0.1:27017/Aayush_Sir").then(()=>{
    console.log('connected')
  }).catch((err)=>{
    console.log(err)
  })
}

module.exports = connection
