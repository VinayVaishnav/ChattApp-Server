const errorMiddleware=(err,req,res,next)=>{
    // console.log("Calling error Middleware");
    // console.log(err.message);
    err.message =err.message|| "Internal Server Error";
    err.statusCode= err.status|| 500;
    // console.log(err);
    if(err.code===11000){
        const error=Object.keys(err.keyPattern).join(",");
        err.message=  `Duplicate field - ${error}1`;
        err.statusCode ||= 400;
    }

    if(err.name==="CastError"){
        const errorPath=err.path;
        err.message=`Invalid format of ${errorPath}`;
        errorMiddleware.statusCode=400;
    }

    return res
        .status(err.statusCode)
        .json({
            success:false,
            message: err,
        });
};

const TryCatch=(passedFunction)=>async(req, res, next)=>{
    try{
        await passedFunction(req,res,next);
    } catch(error){
        next(error);
    }
};

const a =TryCatch()

export {errorMiddleware, TryCatch}; 