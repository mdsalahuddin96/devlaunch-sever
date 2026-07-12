const express=require("express")
const cors=require("cors")
const dotenv=require('dotenv')
dotenv.config()
const port=5000;
const app=express()
app.use(express.json())
app.use(cors())


app.listen(port,()=>{console.log("Server running on port 5000")})