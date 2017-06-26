//test mongoose
//set up db in known state, make a request to API, inspect response,
//inspect state of db, and tear down db)
const { runServer, app, closeServer } = require('../server.js')
const faker = require('faker');
const mongoose = require('mongoose');
const chai = require('chai');
const express = require('express');
const should = chai.should()
const chaiHttp = require('chai-http');
const { BlogPost } = require('../models');
const { DB_URL } = require('../config');
mongoose.Promise = global.Promise;



chai.use(chaiHttp);

function adder(x, y) {
    return x + y;
}
function createBlogInfo() {
    return {

        author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
        },
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
        created: faker.date.past()
    }

};

function seedBlogInfo() {
    console.info('seeding restaurant data');
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push(createBlogInfo());
    }

    return BlogPost.insertMany(seedData);
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('should equal 1 + 1', function () {
    it('should equal 1 + 1', function () {
        let answer = adder(1, 1);
        answer.should.equal(2);
    })
})

//get test
describe('Get Posts', function () {
    before(function () {
        return runServer(DB_URL);
    });

    beforeEach(function () {
        return seedBlogInfo();
    });

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    })
    it('should return all posts', function () {
        let res;
        return chai.request(app)
            .get('/posts')
            .then(function (_res) {
                res = _res
                console.log(res);
                res.should.have.status(200);
                res.body.blogs.should.have.length.of.at.least(1);
                return BlogPost.count();
            })
            .then(function (count) {
                res.body.restaurants.should.have.length.of(count);
            });

    })
});
//get by id test
//post test
const blogPost = {
    "title": "Harry Potter",
    "author": "J.K Rowling",
    "content": "There was a wizard"
};

describe('Blog Post Request', function () {
    it('should post blog post'), function () {
        return chai.request(app)
            .post('/posts')
            .send(blogPost)
            .then(function (res) {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys(
                    'id', 'title', 'author', 'content');
                res.body.title.should.equal(blogPost.title);
                done();
            });
    }
})
//put by id
//delete by id
