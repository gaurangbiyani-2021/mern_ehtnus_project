import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from '../models/User.js';
import express from 'express';
const router = express.Router();

export const register = async(req,res)=>{
    try{
        const {username,email,password}=req.body
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hashSync(password,salt)
        const newUser=new User({username,email,password:hashedPassword})
        const savedUser=await newUser.save()
        res.status(200).json(savedUser)
        console.log('register successful');
    }
    catch(err){
        res.status(500).json(err)
    }

}
//LOGIN
export const login = async (req,res)=>{
    try{
        const user=await User.findOne({email:req.body.email})
       
        if(!user){
            return res.status(404).json("User not found!")
        }
        const match=await bcrypt.compare(req.body.password,user.password)
        
        if(!match){
            return res.status(401).json("Wrong credentials!")
        }
        const token=jwt.sign({_id:user._id,username:user.username,email:user.email},process.env.SECRET,{expiresIn:"3d"})
        const {password,...info}=user._doc
    
        res.cookie("token",token).status(200).json(info)
        console.log("login successful");
    }
    catch(err){
        console.log(err);
        res.status(500).json(err)
    }
}


//LOGOUT
export const logout = async (req,res)=>{
    try{
        res.clearCookie("token",{sameSite:"none",secure:true}).status(200).send("User logged out successfully!")
        console.log("logged out successfully");
    }
    catch(err){
        res.status(500).json(err)
    }
}

//refetch the user

export const refetch = (req,res)=>{
    const token=req.cookies.token
    jwt.verify(token,process.env.SECRET,{},async (err,data)=>{
        if(err){
            return res.status(404).json(err)
        }
        res.status(200).json(data)
    })
};

