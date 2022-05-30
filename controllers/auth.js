

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../models/user');


exports.signup = async(req, res, next) =>{
    try{


        const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const hashPassword = await bcrypt.hash(password, 12);
  
    
    const user = new User({
        email:email,
        password:hashPassword,
        name:name
    });
    console.log(user);
    const result = await user.save();
    res.status(201).json({message: 'User created!', userId:result._id});




    }catch(err){
        console.log(err);
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    };

};

exports.login = async (req, res, next) => {

    try{
        const email = req.body.email;
        const password = req.body.password;
        let loadeduser;
        const user = await User.findOne({email:email});
        if(!user){
            const error = new Error('A user with this email could not be found.');
            error.statusCode = 401;
            throw error;
        }
        loadeduser = user;
        const isEqual = await bcrypt.compare(password, user.password);

         
        if(!isEqual){
             const error = new Error('Wrong password!');
             error.statusCode = 401;
             throw error;
         }
         const token = jwt.sign({
             email:loadeduser.email,
             userId: loadeduser._id.toString()
         },
         process.env.PRIVATEKEY,
         { expiresIn: '1h' }

         );

         res.status(200).json({token:token, userId:loadeduser._id.toString() });




    }catch(err){
        console.log(err);
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.status = async (req, res, next) =>{
    try{

        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({status:user.status});

    }catch(err){
        console.log(err);
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};