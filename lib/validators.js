import { body, param, validationResult } from "express-validator";
import { ErrorHandler } from "../utils/utility.js";

const registerValidator= ()=>[
    body("name","Please Enter Name").notEmpty(),
    body("username","Please Enter UserName").notEmpty(),
    body("bio","Please Enter Bio").notEmpty(),
    body("password","Please Enter Password").notEmpty(),
];
const loginValidator= ()=>[
    body("username","Please Enter UserName").notEmpty(),
    body("password","Please Enter Password").notEmpty(),
];
const newGroupValidator= ()=>[
    body("name","Please Enter Name").notEmpty(),
    body("members")
        .notEmpty()
        .withMessage("Please enter Members")
        .isArray({min:2,max:10})
        .withMessage("members must be between 2 to 100")
];

const addMemberValidator= ()=>[
    body("chatId","Please Enter chatId").notEmpty(),
    body("members")
        .notEmpty()
        .withMessage("Please enter Members")
        .isArray({min:1,max:97})
        .withMessage("members must be between 1 to 97")
];

const removeMemberValidator= ()=>[
    body("userId","Please Enter UserId").notEmpty(),
    body("chatId","Please Enter chatId").notEmpty(),
];

const sendAttachmentValidator =()=>[
    body("chatId","please enter chat id").notEmpty(),
]; 

const chatIdValidator =()=>[
    param("id","please enter id").notEmpty(),
];

const renameGrpValidator =()=>[
    param("id","please enter id").notEmpty(),
    body("name","please enter new name").notEmpty(),
];
const sendFriendRequestValidator =()=>[
    body("userId","please enter User ID").notEmpty(),
];
const acceptRequestValidator =()=>[
    body("requestId","please enter Request ID").notEmpty(),
    body("accept")
        .notEmpty()
        .withMessage("Please add accept")
        .isBoolean()
        .withMessage("Accept must be boolean"),
];

const validate=(req,res,next)=>{
    const errors= validationResult(req);
    const errorMessages=errors.array().map((error)=>error.msg).join(",");
    // console.log("Calling validate");
    console.log(errorMessages);
    if(!errors.isEmpty()) console.log("error hai");
    
    if(errors.isEmpty()) return next();
    else next(new ErrorHandler(errorMessages,400));
};

const adminLoginValidator=()=>[
    body("secretKey","Please Enter Secrete Key").notEmpty(),
]


export {
    acceptRequestValidator, addMemberValidator, adminLoginValidator, chatIdValidator, loginValidator,
    newGroupValidator, registerValidator, removeMemberValidator, renameGrpValidator, sendAttachmentValidator, sendFriendRequestValidator, validate
};
