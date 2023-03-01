import User from "../model/User.js"
import bcrypt from "bcryptjs"
import validator from "email-validator"

export const getAllUser=async(req,res)=>{
    let user
    try {
        user=await User.find()
    } catch (error) {
        return console.log(err)
    }
    if(!user){
        return res.status(400).json({
            success:false,
            message:"Error finding users."
        })
    }
    return res.status(200).json({
        success:true,
        result:user.length,
        data:user
    })
}

export const signup=async(req,res)=>{
    const {name,email,password}=req.body
    if(!name || name.trim()==="" || !email || email.trim()==="" || !password || password.length<6){
        return res.status(500).json({
            success:false,
            error:"Please enter valid info"
        })
    }
    if(!validator.validate(email)){
        return res.status(500).json({
            success:false,
            error:"Please enter valid Email"
        })
    }
    let existingUser
    try {
        existingUser=await User.findOne({email})
    } catch (error) {
        return console.log(error)
    }
    if(existingUser){
        return res.status(400).json({
            error:"Alreary registered, please login."
        })
    }
    let user
    const hashedPassword=bcrypt.hashSync(password)
    try {
        user=new User({
            name,
            email,
            password:hashedPassword
        })
        await user.save()
    } catch (error) {
        return console.log(error)
    }
    if(!user){
        return res.status(422).json({
            success:false,
            message:"Unexpected error occured"
        })
    }
    return res.status(201).json({
        success:true,
        message:"Signup successful",
        data:user
    })
}


export const login=async(req,res)=>{
    const {email,password}=req.body
    if(!email || email.trim()==="" || !password || password.trim()==""){
        return res.status(422).json({
            success:false,
            error:"Please provide valid info."
        })
    }
    let user
    try {
        user=await User.findOne({email})
    } catch (error) {
        return console.log(error)
    }
    if(!user){
        return res.status(400).json({
            success:false,
            error:"User not found Please signup"
        })
    }
    const isPasswordMatch=bcrypt.compareSync(password,user.password)
    if(!isPasswordMatch){
        return res.status(422).json({
            sucsess:false,
            error:"Incorrect password."
        })
    }
    return res.status(200).json({
        success:true,
        message:"Login successful",
        data:user
    })
}

export  const getUserById=async(req,res)=>{
    const id=req.params.id
    let user
    try{
        user=await User.findById(id).populate("blogs")
    }catch(err){
        return console.log(err)
    }
    if(!user){
        return res.status(400).json({
            success:false,
            message:"Unable to find User"
        })
    }
    return res.status(200).json({user})
}
