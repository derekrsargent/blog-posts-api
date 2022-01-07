const axios = require('axios');
const { getCachedValue, setCachedValue, getUncachedTags } = require('../services/cache');

const postController = async (req, res) => {
    const queryObject = req.query; 
    const cache = req.res.cache;

    let tags = [], 
        posts = [],
        cachedPosts = [],
        uncachedPosts = [];
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

    const uncachedTagsArr = getUncachedTags(tags, cache);
    console.log('uncached: ', uncachedTagsArr);

    try {
        data = 
            uncachedTagsArr.map(tag => 
                axios.get(`https://api.hatchways.io/assessment/blog/posts?tag=${tag}`)
            );
    } catch (err) {
        return res.status(500).json({ "error": err.message });
    };

    const checkIfExists = (postId, arr) => {
        return arr.some(({id}) => id === postId);
    };

    let response;
    try {
        response = await Promise.all(data);
        response
            .map(postsByTag => postsByTag.data.posts
                .map(post => !checkIfExists(post.id, posts) && posts.push(post)));
    } catch (err) {
        return res.status(500).json({ "error": err.message });
    };

    // Add the uncached posts into the cache
    try {
        response.map((postsByTag, index) => setCachedValue(uncachedTagsArr[index], postsByTag.data.posts, cache));
    } catch (err) {
        return res.status(500).json({ "error": err.message });
    };

    // --- CACHE
    const cachedTagsArr = tags.filter(tag => !uncachedTagsArr.includes(tag));
    console.log('cached: ', cachedTagsArr);

    // Add the cached posts after the uncached to maximize the most recent results
    // being used.
    cachedTagsArr.map(tag => cachedPosts.push(getCachedValue(tag, cache)));
    //console.log(getCachedValue('tech', cache))
    //console.log(cachedPosts)
    cachedPosts.map(postsByTag => postsByTag.map(post => !checkIfExists(post.id, posts) && posts.push(post)));

    // ---

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
