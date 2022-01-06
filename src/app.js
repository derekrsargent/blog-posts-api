const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const apiRouter = require('./routes/api');

const app = express(); 
const cache = new NodeCache({ stdTTL: 600 });

app.use(express.json());
app.use(cors());

app.use('/', (req, res, next) => { res.cache = cache; next();}, apiRouter);

const verifyCache = (req, res, next) => {
    // const { id } = req.params;
    // memcached.get(id, (err, val) => {
    //   if (err) throw err;
    //   if (val !== null) {
    //     return res.status(200).json(JSON.parse(val));
    //   } else {
        return next();
    //   }
    // });
};

app.use("/getget", verifyCache, async (req, res) => {
    console.log('getget')
    // const { id } = req.params;
    // const data = { id, ...req.body };
    // await memcached.set('123', JSON.stringify({"f": "u"}), { expires: 12 });
    // const data = await memcached.get('123');
    cache.set('123', 'ok');
    const data = await cache.get('123');
    return res.status(201).json({"hello": data});
});

// module.exports = {
//     app,
//     cache
// }; 

module.exports = app;