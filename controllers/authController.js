const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { Connection, Keypair } = require('@solana/web3.js');
const connection = new Connection('https://api.devnet.solana.com');

const createToken = (id) => {
   return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
   });
};

const createAndSendToken = (user, statusCode, res, text) => {
   const token = createToken(user._id);
   user.password = undefined;
   user.secretKey = undefined;
   res.header('Authorization', `Bearer ${token}`);
   res.status(statusCode).json({
      token,
      user,
   });
};

exports.protect = async (req, res, next) => {
   //1) Get token and check if its there
   try {
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
         token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
         return next(
            res
               .status(401)
               .json({ message: 'You are not logged in. Please log in to gain access!' })
         );
      }

      //2) Verifying token
      let decoded;
      try {
         decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      } catch (err) {
         return res.status(401).json({
            status: 'fail',
            message: ['Invalid token, Please log in again!'],
         });
      }

      //3) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
         return res.status(401).json({
            status: 'fail',
            message: 'The user belonging to this token does not exist',
         });
      }

      // 4) Check if user changed password after the token was issued
      // if(currentUser.changedPasswordAfter(decoded.iat)){
      //     return res.status(401).json({
      //         status: 'fail',
      //         message: "User recently changed password! Please log in again!"
      //     })
      //}
      //GRANT ACCESS
      req.user = currentUser;
      next();
   } catch (err) {
      return res.status(500).json(err);
   }
};

exports.signup = async (req, res, next) => {
   try {
      const keyPair = Keypair.generate();
      console.log('Public Key:', keyPair.publicKey.toString());
      console.log('Secret Key:', keyPair.secretKey);

      const publicKey = keyPair.publicKey.toString();
      const secret_array = keyPair.secretKey
         .toString()
         .split(',')
         .map((value) => Number(value));

      const newUser = await User.create({
         name: req.body.name,
         email: req.body.email,
         password: req.body.password,
         publicKey: publicKey,
         secretKey: secret_array,
         passwordChangedAt: Date.now(),
      });
      createAndSendToken(newUser, 201, res);
   } catch (err) {
      res.status(400).json({ error: 'Invalid signup request. Please check your input.', err });
   }
};

exports.login = async (req, res, next) => {
   try {
      const { email, password } = req.body;
      // 1) Check if email and password exists
      if (!email || !password) {
         return res.status(401).json({
            status: 'fail',
            message: 'Please provide email and password',
         });
      }

      // 2) Check if user & password exists
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.correctPassword(password, user.password))) {
         return res.status(401).json({
            status: 'fail',
            message: 'Incorrect email or password',
         });
      }

      //3) If it's okay, send token to client
      createAndSendToken(user, 200, res);
   } catch (err) {
      res.status(400).json(err);
   }
};
