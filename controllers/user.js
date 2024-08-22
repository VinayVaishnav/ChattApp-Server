import { compare } from "bcrypt";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import { emitEvent } from "../controllers/chat.js";
import { getOtherMember } from "../lib/helper.js";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Request } from "../models/request.js";
import { User } from "../models/user.js";
import { cookieOptions, sendToken, uploadFilesToCloudinary } from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";

const newUser= TryCatch(async(req,res,next)=>{

    const {name,username,password,bio}=req.body;
    // console.log(req.body);

    const file=req.file
    if(!file) console.log("no file");
    // else console.log(file);
    
    if(!file) return (
        res.status(400).json({
            success: false,
            message: "Please upload file",
            statusCode: 400,
        })
    );

    const result=await uploadFilesToCloudinary([file]);
    // console.log(result);

    const avatar={
        public_id: result[0].public_id,
        url:result[0].url,
    }
    // console.log(avatar);
    const user= await User.create({
        name,
        bio,
        username,
        password, 
        avatar
    });
    // console.log(user);


    sendToken(res,user,201,"User Created");
});


const login= TryCatch(async (req,res,next)=>{
    const {username,password}=req.body;

    const user= await User.findOne({username}).select("+password");
    if(!user) console.log("no user found");

    if(!user) return (
        res.status(400).json({
        success: false,
        message: "user not found",
        statusCode: 400,
    }));

    const isMatch=await compare(password,user.password);

    if(!isMatch){
        return (
            res.status(400).json({
            success: false,
            message: "Invalid password",
            statusCode: 400,
        }));
    }

    sendToken(res,user,200,`Welcome back ${user.name}`);
});

const getMyProfile= TryCatch(async(req,res,next)=>{

    const user = await User.findById(req.user);

    res.status(200).json({
        success:true,
        user,
    });
});

const Logout= TryCatch(async(req,res)=>{

    return res.status(200)
    .cookie("chatty-token","",{ ...cookieOptions,maxAge:0})
    .json({
        success:true,
        message:"Logged out successfully",
    });
});

const SearchUser= TryCatch(async(req,res)=>{

    const {name}=req.query;
    const myChats=await Chat.find({
        groupChat:false, members:req.user,
    });

    const allUsersFromMyChat=myChats.flatMap((chat)=> chat.members);

    const allUsersExceptMeAndFriends = await User.find({
        _id:{$nin: allUsersFromMyChat},
        name:{$regex: name, $options:"i"},
    });

    const users=allUsersExceptMeAndFriends.map(({_id,name,avatar})=>({
        _id,
        name,
        avatar: avatar.url
    }));

    return res
        .status(200)
        .json({
            success:true,
            users,
        });
});

const sendFriendRequest= TryCatch(async(req,res,next)=>{
    const {userId}=req.body;

    const request=await Request.findOne({
        $or:[
            {sender: req.user, receiver:userId},
            {sender:userId, receiver: req.user},
        ]
    });

    if(request) return (
        res.status(400).json({
            success: false,
            message: "Request already sent",
        })
    );

    await Request.create ({
        sender: req.user,
        receiver:userId,
    })

    emitEvent(req,NEW_REQUEST,[userId]);

    return res.status(200)
    .json({
        success:true,
        message:"friend request sent",
    });
});
const acceptFriendRequest= TryCatch(async(req,res,next)=>{

    // console.log("accepting");

    const {requestId,accept}=req.body;

    const request=await Request.findById(requestId)
        // .populate("sender","name")
        // .populate("receiver","name")
    ;

    if(!request) return next(new ErrorHandler("Request not found",404));
    // console.log("found");

    // console.log(request);
    // console.log(req.user.toString());

    if(request.receiver._id.toString() !==req.user.toString())
        return next(
            new ErrorHandler("You are not authorized to accept this requeset",401)    
        );
    
    // console.log("authorized");

    if(!accept) {
        await request.deleteOne();

        return res.status(200).json({
            success:true,
            message: "Friend Request Rejected",
        });
    }
    // console.log("accepted");

    
    const members=[request.sender._id,request.receiver._id];

    await Promise.all([
        Chat.create({
            members,
            name: `${request.sender.name}-${request.receiver.name}`,
        }),
        request.deleteOne(),
    ]);

    emitEvent(req,REFETCH_CHATS,members);

    return res.status(200)
    .json({
        success:true,
        message:"Request accepted",
        senderId: request.sender._id,
    });
});

const getAllNotification = TryCatch(async (req,res,next)=>{
    const requests=await Request.find({receiver:req.user}).populate(
        "sender",
        "name avatar",
    )
    const allRequests=requests.map(({_id,sender})=>({
        _id,sender:{
            _id:sender._id,
            name:sender.name,
            avatar:sender.avatar.url,
        }
    }))
    return res.status(200).json({
        success:true,
        allRequests,
    })
});

const getMyFriends = TryCatch(async (req,res,next)=>{

    const chatId=req.query.chatId;
    const chats=await Chat.find({
        members:req.user,
        groupChat: false,
    }).populate("members","name avatar");

    const  friends=chats.map(({members})=>{
        const otherUser=getOtherMember(members,req.user)
        return {
            _id:otherUser._id,
            name:otherUser.name,
            avatar:otherUser.avatar.url,
        };
    });

    if(chatId){
        const chat=await Chat.findById(chatId);
        const availableFriends=friends.filter(
            (friend)=>!chat.members.includes(friend._id)
        )
        console.log("available wale");

        return res.status(200).json({
            success:true,
            friends: availableFriends,
        });
    } else{
        return res.status(200).json({
            success:true,
            friends,
        });
    }
});
 
export {
    Logout,
    SearchUser, acceptFriendRequest,
    getAllNotification,
    getMyFriends, getMyProfile, login,
    newUser, sendFriendRequest
};

