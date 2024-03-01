const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const app = express();
const userRouter = require('./routes/userRoutes.js');
const authRouter = require('./routes/authRoutes.js');
const pingServer = require('./utils/ping');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', userRouter);
app.use('/api', authRouter);

pingServer();
const interval = setInterval(pingServer, 10 * 60 * 1000);

module.exports = app;
