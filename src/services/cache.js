/** 
 *
 * @param {string}  tag - A specific tag from the query string 
 * @param {string[]}  tags - All tags from the query string
 * @param {Object[]}  posts - All posts for a tag
 * @param {Object}  cache - The api cache
 *
 */

const getCachedValue = (tag, cache) => {
    return cache.get(tag);
};

const getUncachedTags = (tags, cache) => {
    if (!Array.isArray(tags)) {
        throw new Error('Urls must be in array format!');
    };

    if(tags.length === 0) {
        return [];
    }

    const uncachedTagsArr = [];

    tags.map(tag => {
        if (!cache.has(tag)) {
            uncachedTagsArr.push(tag)
        }
    });

    return uncachedTagsArr;
};

const setCachedValue = (tag, posts, cache) => {
    cache.set(tag, posts);
    return;
};

module.exports = { 
    getCachedValue,
    setCachedValue,
    getUncachedTags
}; 