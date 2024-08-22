import express from "express";
import { login, newUser,getMyProfile, Logout, SearchUser, sendFriendRequest, acceptFriendRequest, getAllNotification, getMyFriends } from "../controllers/user.js";
import { singleAvatar } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { acceptRequestValidator, loginValidator, registerValidator, sendFriendRequestValidator, validate } from "../lib/validators.js";

const app=express.Router();

app.post("/new",singleAvatar,registerValidator(),validate, newUser);
app.post("/login",loginValidator(),validate,login);
app.use(isAuthenticated);
app.get("/me",getMyProfile);
app.get("/logout",Logout);
app.get("/search",SearchUser);
app.put("/sendrequest",sendFriendRequestValidator(),validate,sendFriendRequest);
app.put("/acceptrequest",acceptRequestValidator(),validate,acceptFriendRequest);
app.get("/notifications",getAllNotification);
app.get("/friends",getMyFriends);


export default app;