import express from "express"
import { getAllUser, getUserById, login, signup } from "../controller/user-controller"


const userRouter=express.Router()

userRouter.get('/',getAllUser)
userRouter.get('/:id',getUserById)
userRouter.post('/login',login)
userRouter.post('/signup',signup)

export default userRouter