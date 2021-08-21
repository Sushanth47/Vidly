require('dotenv').config()
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User } = require('../models/user');
const cookieParser = require('cookie-parser');
const { Customer } = require('../models/customer');


async function generateAuthToken(res, _id, name, req){
   res.clearCookie(req.headers['cookie']);
   const expiration = 604800000;
  const token = jwt.sign(
    {_id: _id, name: name},
  process.env.jwtPrivateKey,
  {
    expiresIn:process.env.DB_ENV === 'testing' ? '1d': '7d'
    
  });
  console.log(token);
  return res.cookie('token', token, {
    expires: new Date(Date.now() + expiration),
    httpOnly:true
  })
}


exports.loginPage = async(req, res)=>{
   var type="userLogin";
   // console.log(req.user, 'req.user');
   return res.status(200).render('./loginPage.ejs', {type:type})
}

exports.signupPage = async(req, res)=>{
   var type="userSignup";
   return res.status(200).render('./signupPage', {type:type});
}

exports.signupPageCustomer = async(req, res)=>{
   var type="customerSignup";
   return res.status(200).render('./signupPage', {type:type});
}

exports.loginPageCustomer = async(req, res)=>{
   var type="customerLogin";
   return res.status(200).render('./loginPage.ejs', {type:type});
}


exports.getUser = async(req, res)=>{
   res.clearCookie(req.headers['cookie']);
   res.locals = {}
   let user = await User.findOne({email:req.body.email});
   if (user) return res.status(400).send('User already registered');
   user = new User(_.pick(req.body, ['name', 'email', 'password'])); 
   
   const token = generateAuthToken(res, user._id, user.name, req);
   // user.phoneToken = token.cookies;
   user.active = true;
   req.user = user
   await user.save();
   res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
}

exports.getUserfromdata = async(req, res)=>{
   res.clearCookie(req.headers['cookie']);
   res.locals.subject='User'
   let user = await User.findOne({email:req.body.email});
   // console.log(user);
   if (!user || req.body.password != user.password){ 
      // return req.flash('errorMessage', 'Invalid Credentials')
      return res.status(400).send('Invalid Email/Password');
   }
   const token = generateAuthToken(res, user._id, user.name, req);
   // user.phoneToken = token;
   user.active = true;
   req.user = user;
   // console.log(req.user);
   // req.user.save();
   user.save();
   return res.status(200).redirect('/api/movies/movies');
}

exports.logoutUser = async(req, res)=>{
   try{
   console.log(req.user, 'userhere');
   var userfind = await User.findOne({_id:req.user._id});
   userfind.active = false;
   userfind.save();
   // console.log(res.cookies, 'cookies here');
   res.clearCookie('token');
   console.log('======================================================')
   return res.status(200).redirect('/api/movies/movies');

   }catch(err){
      console.log(err);
   }
}

exports.logoutCustomer = async(req, res)=>{
   try{
   var customerfind = await Customer.findOne({_id:req.user._id});
   customerfind.active = false;
   customerfind.save();
   res.clearCookie('token')
   return res.status(200).redirect('/api/movies/movies');
   
}catch(err){
      console.log(err);
   } 
}

exports.getCustomerfromData = async(req, res)=>{
   try{
   res.clearCookie(req.headers['cookie']);
   res.locals.subject='User';
   var customer = await Customer.findOne({phone:req.body.phone, password:req.body.password});
   if(!customer || req.body.password!=customer.password){
      return res.status(400).json('Invalid Email/Password');
   }
   const token = generateAuthToken(res, customer._id, customer.name, req);
   // customer.phoneToken = token.cookies;
   req.user = customer;
   customer.save();
   return res.status(200).redirect('/api/movies/movies');

   }catch(err){
      console.log(err);
   }
}

exports.getCustomer = async(req, res)=>{
   // res.clearCookie(req.headers['cookie']);
   try{
      res.locals={};
      let customer = await Customer.findOne({phone:req.body.phone});
      if(customer) {return res.status(400).send('User already Exists');}
      customer = new Customer(_.pick(req.body, ['name', 'email', 'password', 'phone']));

      const token = await generateAuthToken(res, customer._id, customer.name, req);
      // console.log(token, 'token');
      // customer.phoneToken = token.cookies;
      customer.active = true;
      customer.isGold = false;
      req.user = customer;
      res.locals = customer;
      // req.user.sa
      await customer.save();
      // res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
      return res.status(200).redirect('/api/movies/movies');
   }
   catch(err){
      console.log(err);
   }
   
}



// function validate(req){
//    const schema = Joi.object({
//        email:Joi.string().min(3).required().email(),
//        password: Joi.string.min(3).required()
//      });
//    return schema.validate(user);
// }
