const mongoose=require("mongoose")
const connectDB=async ()=>{
try{
await mongoose.connect(process.env.mongo_DB_url)
console.log("DB connected successfully")
}
catch(e){
console.log("DB connection failed ")
}
}
module.exports=connectDB