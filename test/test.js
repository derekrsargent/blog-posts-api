const server = require('../src/server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { performance } = require('perf_hooks');

chai.use(chaiHttp);

const should = chai.should();
const uri = 'http://localhost:3000';

describe('API Test', function () {
    describe('Fetch an incorrect endpoint', function () {
        it('should GET an error 404 Not Found message', function (done) {
            chai.request(uri)
                .get('/incorrect')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
    });

    describe("Fetch the test ('\\ping') endpoint", function () {
        it("should GET a 'success: true' message", function (done) {
            chai.request(uri)
                .get('/api/ping')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.be.eql({ success: true });
                    done();
                });
        });
    });

    describe("Fetch without a required 'tag' query string", function () {
        it('should GET an error message because of no tag', function (done) {
            chai.request(uri)
                .get('/api/posts')
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.eql({
                        error: 'Tags parameter is required',
                    });
                    done();
                });
        });
    });

    describe("Fetch with an incorrect 'direction' query string", function () {
        it('should GET an error message', function (done) {
            chai.request(uri)
                .get('/api/posts?tag=tech&direction=none')
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.eql({
                        error: 'direction parameter is invalid',
                    });
                    done();
                });
        });
    });

    describe("Fetch with an incorrect 'sortBy' query string", function () {
        it('should GET an error message', function (done) {
            chai.request(uri)
                .get('/api/posts?tag=tech&sortBy=none')
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.eql({
                        error: 'sortBy parameter is invalid',
                    });
                    done();
                });
        });
    });

    describe('Fetch with one tag query string', function () {
        it("should GET all posts that have a 'tech' tag in ascending order (by default)", function (done) {
            chai.request(uri)
                .get('/api/posts?tag=tech')
                .end((err, res) => {
                    // First, check the status
                    res.should.have.status(200);

                    // Second, check that the tags all include 'tech'
                    let tagResult = true;
                    res.body.posts.forEach((post) => {
                        if (tagResult === true) {
                            tagResult = post.tags.some((el) => el === 'tech');
                        }
                    });
                    tagResult.should.be.eql(true);

                    // Lastly, check for ascending order on id by default
                    let prevId = -1;
                    let directionResult = true;
                    res.body.posts.forEach((post) => {
                        post.id > prevId
                            ? (prevId = post.id)
                            : (directionResult = false);
                    });
                    directionResult.should.be.eql(true);

                    done();
                });
        });
    });

    describe('Fetch with same tag query string to check cache', function () {
        it("should GET all posts that have a 'tech' tag in ascending order (by default)", function (done) {
            const t0 = performance.now();
            chai.request(uri)
                .get('/api/posts?tag=tech')
                .end((err, res) => {
                    // First, check the status
                    res.should.have.status(200);

                    // Lastly, it takes around >300 ms for an API call, so cache will be less
                    const t1 = performance.now();
                    const time = t1 - t0;
                    time.should.be.lessThan(150);

                    done();
                });
        });
    });

    describe('Fetch with two tag query strings', function () {
        it("should GET all posts that have a 'tech' OR 'startups' tag", function (done) {
            chai.request(uri)
                .get('/api/posts?tag=tech,startups')
                .end((err, res) => {
                    // First, check the status
                    res.should.have.status(200);

                    // Second, check that the tags include at least one of 'tech' or 'startups'
                    let tagResult = true;
                    res.body.posts.forEach((post) => {
                        if (tagResult === true) {
                            tagResult =
                                post.tags.some((el) => el === 'tech') ||
                                post.tags.some((el) => el === 'startups');
                        }
                    });
                    tagResult.should.be.eql(true);

                    //Third, check that there are no duplicates by using a Set
                    let idResult;
                    let uniqueIds = new Set();
                    res.body.posts.forEach((post) => uniqueIds.add(post.id));
                    res.body.posts.length === uniqueIds.size
                        ? (idResult = true)
                        : (idResult = false);
                    idResult.should.be.eql(true);

                    // Lastly, check for ascending order on id by default
                    let prevId = -1;
                    let directionResult = true;
                    res.body.posts.forEach((post) => {
                        post.id > prevId
                            ? (prevId = post.id)
                            : (directionResult = false);
                    });
                    directionResult.should.be.eql(true);

                    done();
                });
        });
    });

    describe('Fetch with five tag query strings', function () {
        it("should GET all posts that have a 'tech' OR 'startups' tag", function (done) {
            chai.request(uri)
                .get('/api/posts?tag=tech,startups,science,history,health')
                .end((err, res) => {
                    // First, check the status
                    res.should.have.status(200);

                    // Second, check that the tags include at least one of 'tech' or 'startups'
                    let tagResult = true;
                    res.body.posts.forEach((post) => {
                        if (tagResult === true) {
                            tagResult =
                                post.tags.some((el) => el === 'tech') ||
                                post.tags.some((el) => el === 'startups') ||
                                post.tags.some((el) => el === 'science') ||
                                post.tags.some((el) => el === 'history') ||
                                post.tags.some((el) => el === 'health');
                        }
                    });
                    tagResult.should.be.eql(true);

                    //Third, check that there are no duplicates by using a Set
                    let idResult;
                    let uniqueIds = new Set();
                    res.body.posts.forEach((post) => uniqueIds.add(post.id));
                    res.body.posts.length === uniqueIds.size
                        ? (idResult = true)
                        : (idResult = false);
                    idResult.should.be.eql(true);

                    // Lastly, check for ascending order on id by default
                    let prevId = -1;
                    let directionResult = true;
                    res.body.posts.forEach((post) => {
                        post.id > prevId
                            ? (prevId = post.id)
                            : (directionResult = false);
                    });
                    directionResult.should.be.eql(true);

                    done();
                });
        });
    });

    describe('Fetch with two tag query strings in desc order by reads', function () {
        it('should GET all posts sorted in desc order by reads', function (done) {
            chai.request(uri)
                .get('/api/posts?tag=tech,startups&direction=desc&sortBy=reads')
                .end((err, res) => {
                    // First, check the status
                    res.should.have.status(200);

                    // Lastly, check for descending order on reads
                    let prevId = Number.MAX_SAFE_INTEGER;
                    let directionResult = true;
                    res.body.posts.forEach((post) => {
                        post.reads < prevId
                            ? (prevId = post.reads)
                            : (directionResult = false);
                    });
                    directionResult.should.be.eql(true);

                    done();
                });
        });
    });
});
