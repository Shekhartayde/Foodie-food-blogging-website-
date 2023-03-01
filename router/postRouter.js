import express from "express"
import { addPost, deletePost, getAllPosts, getById, getPostsInRadius, likePost, updatePost } from "../controller/post-controller.js"
import multer from "multer"
import path from "path"

const postRouter=express.Router()

// postRouter.use(express.static(__dirname+"/public/uploads/"))

let storage=multer.diskStorage({
    destination:"./public/uploads/",
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
    }
})

const upload=multer({
    storage:storage,
}).single('image')


postRouter.get('/',getAllPosts)
postRouter.get('/:id',getById)
// postRouter.post('/',addPost)
postRouter.post('/',upload,addPost)
postRouter.put('/:id',updatePost)
postRouter.delete('/:id',deletePost)
postRouter.get('/:address/:distance',getPostsInRadius)
// postRouter.put('/:id/:user',likePost)

export default postRouter
