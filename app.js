require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');


const MONGODB_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.nhvb2.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`


const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');



//const { Socket } = require('socket.io');//
// const { Result } = require('express-validator');

const app = express();


const date = new Date();
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'images');
    },
    filename:(req, file, cb) =>{
        cb(null, 
            "feedpost" + '-'+
            date.getFullYear() +'-'+
           ( date.getMonth()+ 1) +'-'+
            date.getDate() +'-'+
            date.getTime() +'-'+
           // Date.now() +
           //new Date().toISOString() +
           file.originalname);
    }
});

const fileFilter = (req, file,  cb) =>{
    if(file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'    
    ){
        cb(null, true);
    }else{
        cb(null, false);
    }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('image'));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'),{flags: 'a'});



app.use(helmet());
app.use(compression());
app.use(morgan('combined', {stream:accessLogStream}));
 
app.use((error, req, res, next) =>{
    console.log({error, messagess: 'miderlor'});
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message, data});
});

// mongoose
// .connect('mongodb://localhost/feed')
// .then(result => {
//    const server = app.listen(8080);
//    const io = require('socket.io')(server);
//    io.on('connection', socket =>{
//        console.log('Client connected');
//    });
// })
// .catch(err => console.log(err));


mongoose
.connect(MONGODB_URL)
  .then(result => {
      console.log('mogodb connected');
      
  app.listen(process.env.PORT || 8080);
   // const io = require('socket.io')(server);
   // io.on('connection', socket => {
    //  console.log('Client connected');
   // });
  })
  .catch(err => console.log(err));
