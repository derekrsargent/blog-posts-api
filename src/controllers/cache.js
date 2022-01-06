const cacheController = (req, res) => {

    // return (req, res) => {
        console.log(req.res.cach123)
        console.log(req.res.cache);
        const cache = req.res.cache;

        console.log(cache.get('hello'));
        cache.set('hello', 'world');
        res.status(200).json({ "cached": "reached" })
    // }
};

module.exports = cacheController; 