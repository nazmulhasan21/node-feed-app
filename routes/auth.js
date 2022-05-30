
const { body } = require( 'express-validator');


const express = require("express");
const router = express.Router();



const User = require('../models/user');
const authControllers = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

router.put('/signup',[
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value, {req}) => {
        return User.findOne({email:value}).then(userDoc =>{
            if(userDoc){
                return Promise.reject('E-Mail address already exists!');
            }
        }); 
    })
    .normalizeEmail(),
    body('password')
    .trim()
    .isLength({min: 5}),
    body('name')
    .trim()
    .not()
    .isEmpty()
], authControllers.signup);


router.post('/login', authControllers.login);
router.get('/status',isAuth, authControllers.status)

module.exports = router; 