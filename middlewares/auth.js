import dotenv from 'dotenv';
import jsonwebtoken from "jsonwebtoken";
import { adminSecretKey } from '../app.js';
import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from './error.js';
import { CHATTY_TOKEN } from '../constants/config.js';
import { User } from '../models/user.js';

dotenv.config();

const isAuthenticated= TryCatch((req,res,next)=>{
    console.log("called auth")
    const token=req.cookies["chatty-token"];
    console.log("checking");
    if(!token) 
        return next(new ErrorHandler("please login to access this route",401))

    console.log("hua h");
    const decodeData=jsonwebtoken.verify(token , process.env.JWT_SECRETE);
    
    // console.log("data: ",decodeData);

    req.user=decodeData._id;
    next();
});

const amdinOnly= (req,res,next)=>{
    const token=req.cookies["chatty-admin-token"];
    if(!token) 
        return next(new ErrorHandler("please login to access this route",401))

    const secretKey=jsonwebtoken.verify(token , process.env.JWT_SECRETE);
    
    const isMatched=secretKey===adminSecretKey;
    if(!isMatched){
        return next(new ErrorHandler('Invalid key',400)); 
    }

    next();
};

const socketAuthenticator = async(err,socket,next)=>{
    try{
        if(err) return next(err);
        const authToken=socket.request.cookies[CHATTY_TOKEN];

        if(!authToken){
            return next(new ErrorHandler("please login to access this route",401));
        }

        const decodeData=jsonwebtoken.verify(authToken,process.env.JWT_SECRETE);

        const user=await User.findById(decodeData._id);
        
        if(!user){
            return next(new ErrorHandler("please login to access this route",401));
        }

        socket.user=user;

        return next();

    } catch(error){
        console.log(error);
        return next(new ErrorHandler("Please login to access the page",401))
    }
}

export { amdinOnly, isAuthenticated,socketAuthenticator };
