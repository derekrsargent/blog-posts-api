const axios = require('axios');

const postController = async (req, res) => {
    const queryObject = req.query; 
    let tags = [], 
        posts = [];
    let sortBy = 'id',
        direction = 'asc';
    let data; 

    if (!queryObject.tag) {
        return res.status(400).json({ "error": "Tags parameter is required" });
    };

    if (queryObject.sortBy && 
        queryObject.sortBy !== 'id' &&
        queryObject.sortBy !== 'reads' && 
        queryObject.sortBy !== 'likes' && 
        queryObject.sortBy !== 'popularity'
    ) {
        return res.status(400).json({ "error": "sortBy parameter is invalid" });
    } else if (queryObject.sortBy) {
        sortBy = queryObject.sortBy; 
    };

    if(queryObject.direction &&
        queryObject.direction !== 'asc' && 
        queryObject.direction !== 'desc'
    ) {
        return res.status(400).json({ "error": "direction parameter is invalid" });
    } else if (queryObject.direction) {
        direction = queryObject.direction;
    };

    tags = queryObject.tag.split(',');

    try {
        data = 
            tags.map(tag => axios.get(`https://api.hatchways.io/assessment/blog/posts?tag=${tag}`));
    } catch (err) {
        return res.status(500).json({ "error": err.message });
    };

    const checkIfExists = (postId, arr) => {
        return arr.some(({id}) => id === postId);
    };

    //const newCache = await caches.open('new-cache');

    try {
        const response = await Promise.all(data);
        response
            .map(postsByTag => postsByTag.data.posts
                .map(el => !checkIfExists(el.id, posts) && posts.push(el)));
    } catch (err) {
        return res.status(500).json({ "error": err.message });
    };

    const customSort = (property) => {
        const sortDirection = direction === 'asc' ? 1 : -1;
        return function (a,b) {
            const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortDirection;
        }
    };

    posts.sort(customSort(sortBy));

    res.status(200).json({ "posts": posts });
};

module.exports = postController; 
