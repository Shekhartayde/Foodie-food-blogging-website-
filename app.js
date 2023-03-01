import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import userRouter from "./router/userRouter"
import postRouter from "./router/postRouter"
import cors from 'cors'



const app=express()
dotenv.config()
app.use(cors())
app.use(express.json())
app.use('/public',express.static("public"))

app.use('/user',userRouter)
app.use('/post',postRouter)

mongoose.connect(`mongodb+srv://admin:ImvurlpY7nIdTxh0@cluster0.yxolles.mongodb.net/?retryWrites=true&w=majority`).then(()=>{
    app.listen(5500,()=>{
        console.log(`Connected to database and listening to port 5500`)
    })
}).catch((err)=>{
    console.log(err)
})

