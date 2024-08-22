import mongoose from "mongoose";
import jsonwebtoken from "jsonwebtoken";
import dotenv from 'dotenv'
import {v2 as cloudinary} from 'cloudinary'
import {v4} from 'uuid'
import { getBase64 } from "../lib/helper.js";
dotenv.config();

const cookieOptions={
    maxAge: 15*24*60*60*1000,
    sameSite: "none",
    httpOnly:true,
    secure:true,
}

const connectDB=(uri)=>{
    mongoose
        .connect(uri,{dbName:"Chatty"})
        .then((data)=> console.log(`connected to DB:${data.connection.host}`)) 
        .catch((err)=>{
            // console.log("Nhi ho rah")
            console.log(err);
        })
};

const emitEvent = (req, event, users, data) => {
    const io = req.app.get("io");
    const usersSocket = getSockets(users);
    io.to(usersSocket).emit(event, data);
};

const sendToken=(res,user, code,msg)=>{
    const token=jsonwebtoken.sign({_id:user._id}, process.env.JWT_SECRETE);
    console.log(code);
    return res
        .status(code)
        .cookie("chatty-token",token,cookieOptions)
        .json({
            success:true,
            user,
            msg,
        })
};



const uploadFilesToCloudinary=async(files=[])=>{

    const uploadPromises=files.map((file)=>{
        return new Promise((resolve,reject)=>{
            cloudinary.uploader.upload(
                getBase64(file),
                {
                    resource_type: "auto",
                    public_id : v4(),
                }, (error,result)=>{
                    if( error) return reject(error);
                    resolve (result);
            });
        });
    });
    
    try{
        const results=await Promise.all(uploadPromises);
        const formattedResults=results.map((result)=>({
            public_id:result.public_id,
            url : result.secure_url,
        }));
        return formattedResults;
    } catch(err){
        console.log(err);
        throw new Error("Error uploading files",err);
    }
}

const deleteFilesFromCloudinary=async (public_ids)=>{};

export {connectDB, sendToken,cookieOptions,deleteFilesFromCloudinary,uploadFilesToCloudinary,emitEvent};