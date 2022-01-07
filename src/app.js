const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const apiRouter = require('./routes/api');

const app = express(); 
const cache = new NodeCache({ stdTTL: 30 });

app.use(express.json());
app.use(cors());

app.use('/', (req, res, next) => { res.cache = cache; next();}, apiRouter);

module.exports = app;
