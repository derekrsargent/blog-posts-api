const express = require('express');
const apiRouter = require('../routes/api');

const app = express(); 

app.use(express.json());
app.use('/', apiRouter);

module.exports = app; 