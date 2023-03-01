import mongoose from "mongoose"
import Post from "../model/Post.js"
import User from "../model/User.js"
import geoCoder from "../utils/geocoder.js"
import multer from "multer"
import path from "path"



export const getAllPosts=async(req,res)=>{
    let post
    try {
        post=await Post.find().populate('user')
    } catch (error) {
        return console.log(error)
    }
    if(!post){
        return res.status(400).json({
            success:false,
            message:"Error finding posts"
        })
    }
    return res.status(200).json({
        success:true,
        result:post.length,
        data:post
    })
}

// export const addPost=async (req,res)=>{
//     const {title,description,dinerName,address,user,image}=req.body
//     if(title.trim()===""||description.trim()===""||dinerName.trim()===""||address.trim()===""|| !user|| !description|| !dinerName || !address || !image){
//         return res.status(400).json({
//             success:false,
//             message:"Please provide complete post Info."
//         })
//     }
//     let existingUser
//     try {
//         existingUser=await User.findOne({_id:user})
//     } catch (error) {
//         return console.log(error)
//     }
//     if(!existingUser){
//         return res.status(400).json({
//             success:false,
//             message:"User not found"
//         })
//     }

//     let post
//     try {
//         post=new Post(req.body)
//         const session =await mongoose.startSession()
//         session.startTransaction()
//         existingUser.blogs.push(post)
//         await existingUser.save({session})
//         await post.save({session})
//         session.commitTransaction()
//     } catch (error) {
//         return console.log(error)
//     }
//     if(!post){
//         return res.status(422).json({
//             success:false,
//             message:"Unexpected error occured"
//         })
//     }
//     return res.status(201).json({
//         success:true,
//         message:"Post successfully created.",
//         data:post
//     })
// }

export const addPost=async (req,res)=>{
    const image=(req.file) ? req.file.filename : null
    const {title,description,dinerName,address,user}=req.body
    console.log(req.file)
    if(title.trim()===""||description.trim()===""||dinerName.trim()===""||address.trim()===""|| !user|| !description|| !dinerName || !address ){
        return res.status(400).json({
            success:false,
            message:"Please provide complete post Info."
        })
    }
    let existingUser
    try {
        existingUser=await User.findOne({_id:user})
    } catch (error) {
        return console.log(error)
    }
    if(!existingUser){
        return res.status(400).json({
            success:false,
            message:"User not found"
        })
    }

    let post
    try {
        post=new Post({
            title,
            description,
            dinerName,
            address,
            user,
            image:image
        })
        const session =await mongoose.startSession()
        session.startTransaction()
        existingUser.blogs.push(post)
        await existingUser.save({session})
        await post.save({session})
        session.commitTransaction()
    } catch (error) {
        return console.log(error)
    }
    if(!post){
        return res.status(422).json({
            success:false,
            message:"Unexpected error occured"
        })
    }
    return res.status(201).json({
        success:true,
        message:"Post successfully created.",
        data:post
    })
}

export const getById=async (req,res)=>{
    const id=req.params.id
    let post
    try {
        post=await Post.findById(id)
    } catch (error) {
        return console.log(error)
    }
    if(!post){
        return res.status(400).json({
            success:true,
            message:"No post found with given id"
        })
    }
    return res.status(200).json({
        success:true,
        data:post
    })
}

export const updatePost=async (req,res)=>{
    const {title,description,dinerName,address,image}=req.body
    if(title.trim()===""||description.trim()===""||dinerName.trim()===""||address.trim()===""|| !description|| !dinerName || !address || !image){
        return res.status(400).json({
            success:false,
            message:"Please provide complete post Info."
        })
    }
    const id=req.params.id
    let post
    try {
        post=await Post.findByIdAndUpdate(id,req.body,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        })
    } catch (error) {
        return console.log(error)
    }
    if(!post){
        return res.status(400).json({
            success:false,
            message:"Error updating post"
        })
    }
    return res.status(200).json({
        success:true,
        message:"post updated successfully",
        data:post
    })
}

export const deletePost=async (req,res)=>{
    const id=req.params.id
    let post
    try {
        const session =await mongoose.startSession()
        session.startTransaction()
        post=await Post.findById(id).populate('user')
        post.user.blogs.pull(post)
        await post.user.save({session})
        post=await Post.findByIdAndDelete(id)
        await session.commitTransaction()
        
    } catch (error) {
        return console.log(error)
    }
    if(!post){
        return res.status(400).json({
            success:false,
            message:"No post found"
        })
    }
    return res.status(200).json({
        success:true,
        message:"Deleted successfully",
        data:post
    })
}

export const getPostsInRadius=async (req,res)=>{
    const {address,distance}=req.params
    // console.log(address)
    //getting lat,long from geocoder with address
    let loc
    try {
        // console.log(address.replace(/%20/g," "))
        loc=await geoCoder.geocode(address)
        // console.log(loc)
    } catch (error) {
        return console.log(error)
    }
    if(!loc){
        return res.status(400).json({
            success:false,
            message:"Provide proper location address"
        })
    }
    const latitude=loc[0].latitude
    const longitude=loc[0].longitude

    console.log(longitude,latitude)

    const radius=distance/3963

    // const posts=await Post.find({
    //     "location.coordinates":{
    //         $geoWithin:{$centerSphere:[[longitude,latitude],radius]}}
    // })
    let posts
    try {
        posts=await Post.find({
            "location.coordinates":{
                $geoWithin:{$centerSphere:[[longitude,latitude],radius]}}
        }).populate('user')
    } catch (error) {
        return console.log(error)
    }
    if(!posts){
        return res.status(422).json({
            success:false,
            message:"Unexpected error Occured"
        })
    }

    return res.status(200).json({
        success:true,
        results:posts.length,
        data:posts
    })
    
}

// export const likePost=async(req,res)=>{
//     const id=req.params.id
//     const user=req.params.user
//     let post
//     try {
//         post=await Post.findById(id)
//         if(!post.likes.includes(user)){
//             post.likes.push(user)
//         }
//         await post.save()
//     } catch (error) {
//         return console.log(error)
//     }
//     if(!post){
//         return res.status(400).json({
//             success:false,
//             message:"Unexpected error occured"
//         })
//     }

//     return res.status(200).json(post.likes)
    
// }

// export const updatePost=async (req,res)=>{
//     const {title,description,dinerName,address,image}=req.body
//     if(title.trim()===""||description.trim()===""||dinerName.trim()===""||address.trim()===""|| !description|| !dinerName || !address || !image){
//         return res.status(400).json({
//             success:false,
//             message:"Please provide complete post Info."
//         })
//     }
//     const id=req.params.id
//     let post
//     let loc
//     try {
//         loc=await geoCoder.geocode(address)
//         post=await Post.findByIdAndUpdate(id,{
//             title,
//             description,
//             dinerName,
//             address,
//             image,
//             location})
//     } catch (error) {
//         return console.log(error)
//     }
//     if(!post){
//         return res.status(400).json({
//             success:false,
//             message:"Error updating post"
//         })
//     }
    
//     try {
//         // console.log(address.replace(/%20/g," "))
        
//         // console.log(loc)
//     } catch (error) {
//         return console.log(error)
//     }
//     if(!loc){
//         return res.status(400).json({
//             success:false,
//             message:"Provide proper location address"
//         })
//     }
//     // else{
//     //     post.location.coordinates[0]=loc[0].latitude
//     //     post.location.coordinates[1]=loc[0].longitude
//     //     post.location.formattedAddress=loc[0].formattedAddress
//     //     post.location.city=loc[0].city
//     //     post.location.state=loc[0].stateCode
//     //     post.location.zipcode=loc[0].zipcode
//     //     post.location.country=loc[0].countryCode
//     // }

//     return res.status(200).json({
//         success:true,
//         message:"post updated successfully",
//         data:post
//     })
// }
