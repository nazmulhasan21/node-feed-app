
const path = require('path');
const fs = require('fs');
const {validationResult} = require('express-validator');
//const io = require('../socket');


const Post = require('../models/post');
const User = require('../models/user');




exports.getPosts = async(req, res, next) => {
  
  
  

     try{
      const currentPage = req.query.page || 1;
      const perPage = 2;
      const totalItems = await Post.find().countDocuments();

       const posts = await Post.find()
                                .skip((currentPage -1) * perPage)
                                .limit(perPage)
                                .select('-__v')
                             .populate('creator','posts name')
                             .sort({createdAt: -1})
                             

                               ;
       if(posts  < 0){
         const error = new Error('Post not found');
         error.statusCode = 404;
         throw error
       // const error = new Error('validation failed, entered data is incorrect.');
       // error.statusCode = 422;
       // console.log({error, message:'Error throw'})
       // throw error;
       }
       
      
      // console.log({posts, totalItems});
       res.status(200).json({message:'Fetched posts successfully.', posts: posts, totalItems:totalItems});


     }catch(err){
      console.log(err);
      if(!err.statusCode){
        err.statusCode = 500;
        
      }
      next(err);
     }
  


}; 

exports.createPost =async(req, res, next) => {

  


  // const errors = validationResult(req);
  //   if(!errors.isEmpty()){
  //     const error = new Error('validation failed, entered data is incorrect.');
  //     error.statusCode = 422;
  //    // console.log({error, message:'Error throw'})
  //     throw error;
     
  //   }
  //   const title = req.body.title;
  //   const content = req.body.content;
  //   // Create post in db
  
  //   const post = new Post({
  //          title,
  //          content,
  //          imageUrl:'images/Screenshot_1.png',
  //          creator:{name:'Nazmul Hasan'}
  //       });

  //       post.save()
  //       .then(result => {
  //         res.status(201).json({
  //           message:'Post created successfully!',
  //           post: result
  //         });
  //       })
  //       .catch(err =>{
  //         console.log(err);
  //       });




try{

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const error = new Error('validation failed, entered data is incorrect.');
    error.statusCode = 422;
   // console.log({error, message:'Error throw'})
    throw error;
     }

  if(!req.file){
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }

    const title = req.body.title;
    const imageUrl = req.file.destination+'/'+ req.file.filename;
    const content = req.body.content;
   // let creator;
    // Create post in db
  
  
  
    const post = new Post({
       title,
       content,
       imageUrl:imageUrl,
       creator: req.userId
    });
    const result = await post.save();
    const user = await User.findById(req.userId);
   // creator = user;
     user.posts.push(post);
     const creator = await user.save();
     
   // io.getIO().emit('posts', {action: 'create', post:post});
    
    res.status(201).json({
      message: 'Post created successfully!',
      post: result,
      creator:{_id: creator._id, name: creator.name}
    });

  
  
}catch(err){
 console.log(err);
 if(!err.statusCode){
   err.statusCode = 500;
   
 }
 next(err);
};

 
};

exports.getPost = async(req, res, next) =>{
  try{
const postId = req.params.postId;

const post = await Post.findById(postId).populate('creator');
if(!post){
  const error = new Error('Could not find post.');
  error.statusCode = 404;
  throw error
}
res.status(200).json({message: 'Post fetched.', post:post});


  }catch(err){
    console.log(err);
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  };
};
 

exports.updatePost = async(req, res, next)=>{

  try{

            const errors = validationResult(req);
            if(!errors.isEmpty()){
              const error = new Error('validation failed, entered data is incorrect.');
              error.statusCode = 422;
            // console.log({error, message:'Error throw'})
              throw error;
              }

            const postId = req.params.postId;
            const title = req.body.title;
            const content = req.body.content;
            let  imageUrl = req.body.image;
            if(req.file){
              imageUrl = req.file.destination + '/' + req.file.filename;
            }
            if(!imageUrl){
              const error = new Error('No file picked.');
              error.statusCode = 422;
              throw error;
            }

            const post = await Post.findById(postId);
          if(!post){
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error
          }
          if(post.creator.toString() !== req.userId){
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
          }
            
          if(imageUrl !== post.imageUrl){
            clearImage(post.imageUrl);
          }

          post.title = title;
          post.imageUrl = imageUrl;
          post.content = content;

          const result = await post.save();
          res.status(200).json({message:'Post updated!', post: result});


  }catch(err){
    console.log(err);
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  };
  

};

exports.deletePost = async (req, res, next) =>{
  try{

    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if(!post){
      const error = new Error('Could not fine post.');
      error.statusCode = 404;
      throw error;
    }
    if(post.creator.toString() !== req.userId){
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }

    // Check logged in user

    clearImage(post.imageUrl);
   // return Post.findByIdAndRemove(postId);
   const removePost = await Post.findOneAndRemove(postId);
   const user = await User.findById(req.userId);
   console.log(user);
  
     await   user.posts.pull(postId);
   const result = await user.save();

    console.log(result);
    res.status(200).json({message: 'Deleted post.'});

  }catch(err){
    console.log(err);
    if(!err.statusCode){
      err.statusCode = 500;
    }
next(err)
  };
};




const clearImage = filePath =>{
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log({err, unlink: 'massage unlink'}));
}