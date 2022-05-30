
const jwt = require('jsonwebtoken');


module.exports =  (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader){
                const error = new Error('Not authenticated.');
                error.statusCode = 401;
                throw error;
            }
            const token = authHeader.split(' ')[1];
            let decodedToken;
            try{
                decodedToken = jwt.verify(token, process.env.PRIVATEKEY);
            }catch(err){
                    console.log(err);
                    //if(!err.statusCode){
                        err.statusCode = 500;
                        throw err;
                   // }
                }
        if(!decodedToken){
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }

        req.userId = decodedToken.userId;
    // try{
        
    //     const authHeader = req.get('Authorization');
    //     if(!authHeader){
    //         const error = new Error('Not authenticated.');
    //         error.statusCode = 401;
    //         throw error;
    //     }
    //     const token = authHeader.split(' ')[1];
    //     const decodedToken =  jwt.verify(token, 'somesupersecretsecret');
    //     if(!decodedToken){
    //         const error = new Error('Not authenticated.');
    //         error.statusCode = 401;
    //         throw error;
    //     }

    //     req.userId = decodedToken.userId;



    // }catch(err){
    //     console.log(err);
    //     if(!err.statusCode){
    //         err.statusCode = 500;
    //         throw err;
    //     }
    // }
    next();
    

};