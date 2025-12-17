const express=require('express');
const dotenv=require('dotenv').config() 
const cors = require('cors')
const routers=require('./routers/routes')
const connectDB=require('./config/db.js')
const app=express();

app.use(express.json())

app.use(cors({
    origin:'*'
}))

connectDB()

app.get('/',(req,res)=>{
    res.send('Backend running!!....');
})
app.use('/',routers)


app.listen(process.env.port,()=>{
    console.log(`Server is running on port ${process.env.port}`);
})

