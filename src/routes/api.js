const express = require('express');
const axios = require('axios');
const postController = require('../controllers/posts')
const router = express.Router();

router.get('/api/ping', (req, res) => {
    res.status(200).json({ "success": true });
});

router.get('/api/posts', postController);

module.exports = router;
