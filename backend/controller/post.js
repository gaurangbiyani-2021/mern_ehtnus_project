import express from 'express';
const router = express.Router();
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import verifyToken from '../verifyToken.js';


//create 
router.post("/create",verifyToken, async (req,res)=>{
    try{
        const newPost=new Post(req.body)
        const savedPost=await newPost.save()
        
        res.status(200).json(savedPost)
    }
    catch(err){
        
        res.status(500).json(err)
    }
     
})

//update
router.put('/:id',verifyToken, async (req,res) => {
    try{       
        const updatedPost=await Post.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true})
        res.status(200).json(updatedPost);
    }
    catch(e){
        console.log(e);
        res.status(500).json(e)
    }
});

//delete

router.delete("/:id",verifyToken, async (req,res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({postId:req.params.id});
        res.status(200).json("Post has been deleted");
    } catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
});

//get post details 

router.get("/:id",async (req,res) => {
    try {
        const post=await Post.findById(req.params.id)
        res.status(200).json(post)
    }
    catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
});

//GET POSTS
router.get("/",async (req,res)=>{
    console.log("get all posts");
    const query=req.query
    try{
        const searchFilter={
            title:{$regex:query.search, $options:"i"}
        }
        const posts=await Post.find(query.search?searchFilter:null)
        res.status(200).json(posts)
    // console.log("done");

    }
    catch(err){
        res.status(500).json(err)
    }
})


//GET USER POSTS
router.get("/user/:userId",async (req,res)=>{
    try{
        const posts=await Post.find({userId:req.params.userId})
        res.status(200).json(posts)
    }
    catch(err){
        res.status(500).json(err)
        console.log(err)
    }
})

//like

router.put("/like/:id",async(req, res) => {
    const id = req.params.id;
    
    try {
      const posts = await Post.findByIdAndUpdate(id,
        { $inc: { like: 1 } },
        { new: true }
    )
    res.status(200).json(posts)

    } catch (err) {
        res.status(500).json(err)
       console.log(err);
    }   
});

//dislike

router.put("/dislike/:id",async(req, res) => {
    const id = req.params.id;
    
    try {
      const post = await Post.findByIdAndUpdate(id,
        { $inc: { dislike: 1 } },
        { new: true }
    );
    if (post.dislike >= 2 * post.like) {
        // Delete the post
        await Post.findByIdAndDelete(id);
        await Comment.deleteMany({ postId: id });

        // Navigate to "/"
        res.status(200).json({ message: "Post deleted due to excessive dislikes" });
    } else {
        res.status(200).json(post);
    }
    
    res.status(200).json(post)

    } catch (err) {
        res.status(500).json(err)
       console.log(err);
    } 

});

export default router