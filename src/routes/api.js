const express = require('express');
const axios = require('axios');
const postController = require('../controllers/posts')
const cacheController = require('../controllers/cache');

const router = express.Router();

router.get('/api/ping', (req, res) => {
    res.status(200).json({ "success": true });
});

router.get('/api/posts', postController);

//router.get('/api/cache', (req, res, next) => { console.log(req.app); next();}, cacheController(99));
router.get('/api/cache', cacheController);

module.exports = router;
