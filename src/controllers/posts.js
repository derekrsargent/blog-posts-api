const axios = require('axios');
const {
    getCachedValue,
    setCachedValue,
    getUncachedTags,
} = require('../services/cache');
const queryStringService = require('../services/api');

const postController = async (req, res) => {
    const queryObject = req.query;
    const cache = req.res.cache;

    let tags = [],
        posts = [],
        cachedPosts = [];
    let data, response;

    const validateQueryString = queryStringService(queryObject);
    if (!validateQueryString.isValid) {
        return res
            .status(400)
            .json({ error: validateQueryString.errorMessage });
    }

    const checkIfExists = (postId, arr) => {
        return arr.some(({ id }) => id === postId);
    };

    tags = queryObject.tag.split(',');

    const uncachedTagsArr = getUncachedTags(tags, cache);
    const cachedTagsArr = tags.filter((tag) => !uncachedTagsArr.includes(tag));

    try {
        data = uncachedTagsArr.map((tag) =>
            axios.get(
                `https://api.hatchways.io/assessment/blog/posts?tag=${tag}`
            )
        );
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

    try {
        response = await Promise.all(data);
        response.map((postsByTag) =>
            postsByTag.data.posts.map(
                (post) => !checkIfExists(post.id, posts) && posts.push(post)
            )
        );
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

    // Add the uncached posts into the cache.
    try {
        response.map((postsByTag, index) =>
            setCachedValue(uncachedTagsArr[index], postsByTag.data.posts, cache)
        );
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

    // Add the cached posts after the uncached to maximize the most recent results
    // being used.
    cachedTagsArr.map((tag) => cachedPosts.push(getCachedValue(tag, cache)));
    cachedPosts.map((postsByTag) =>
        postsByTag.map(
            (post) => !checkIfExists(post.id, posts) && posts.push(post)
        )
    );

    const customSort = (property) => {
        const sortDirection = validateQueryString.direction === 'asc' ? 1 : -1;
        return function (a, b) {
            const result =
                a[property] < b[property]
                    ? -1
                    : a[property] > b[property]
                    ? 1
                    : 0;
            return result * sortDirection;
        };
    };
    posts.sort(customSort(validateQueryString.sortBy));

    res.status(200).json({ posts: posts });
};

module.exports = postController;
