import express from "express";
import { addMembers, deleteChat, getChatDetails, getMessage, getMyChats, getMyGroups, leaveGroup, newGroup, removeMember, renameGroup, sendAttachment } from "../controllers/chat.js";
import { addMemberValidator, chatIdValidator, newGroupValidator, removeMemberValidator, renameGrpValidator, sendAttachmentValidator, validate } from "../lib/validators.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { attachmentMulter } from "../middlewares/multer.js";

const app=express.Router();

app.use(isAuthenticated);

app.post("/new",newGroupValidator(),validate,newGroup);
app.get("/my",getMyChats);
app.get("/my/groups", getMyGroups)
app.put("/addmembers",addMemberValidator(),validate, addMembers)
app.put("/removemember",removeMemberValidator(),validate, removeMember)
app.delete("/leave/:id",chatIdValidator(),validate,leaveGroup)
app.post("/message",attachmentMulter,sendAttachmentValidator(),validate,sendAttachment);
app.route("/:id")
    .get(chatIdValidator(),validate,getChatDetails)
    .put(renameGrpValidator(),validate,renameGroup)
    .delete(validate,deleteChat)
;
app.get("/message/:id",chatIdValidator(),validate,getMessage);

export default app;