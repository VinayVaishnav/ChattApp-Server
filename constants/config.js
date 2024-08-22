const corsOptions={
    origin:[
        "http://localhost:5173",
        "http://localhost:4173",
        "https://chatt-app-client.vercel.app/"
    ],
    methods:["GET","POST","PUT","DELETE"],
    credentials:true,
};

const CHATTY_TOKEN="chatty-token";

export {corsOptions,CHATTY_TOKEN};