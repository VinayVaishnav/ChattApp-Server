import express from "express";
import { adminLogin, adminLogout, allChats, allMessages, allUsers, getAdminData, getDashboardStats } from "../controllers/admin.js";
import { adminLoginValidator, validate } from "../lib/validators.js";
import { amdinOnly } from "../middlewares/auth.js";

const app=express.Router();

app.post("/verify",adminLoginValidator(),validate,adminLogin);
app.get("/logout",adminLogout);

app.use(amdinOnly)
app.get("/",getAdminData)
app.get("/users",allUsers);
app.get("/chats",allChats);
app.get("/messages",allMessages);
app.get("/stats",getDashboardStats);

export default app;