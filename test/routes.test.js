const expect = require('chai').expect;
const request = require('supertest');

const routes = require('../lib/routes');

describe('PUT /functions/:namespace/:id', () => {
    describe('when code is clean', () => {
        it('should return a error', (done) => {
            let code = `define('afterSave', () => {});`;

            request(routes)
                .put('/functions/backstage/correct')
                .send({code})
                .expect('Content-Type', /json/)
                .expect(200, {
                    id: 'correct',
                    code: `define('afterSave', () => {});`,
                    defines: [
                        'afterSave',
                    ],
                    hash: '85f4fd8afe58d5ea4f1749650f0724a6a3164a1b',
                }, done);
        });
    });

    describe('when code has a syntax error', () => {
        it('should return a error', (done) => {
            request(routes)
                .put('/functions/backstage/invalid')
                .send({code: '{)'})
                .expect('Content-Type', /json/)
                .expect(400, {
                    error: 'SyntaxError: Unexpected token )',
                    stack: ''
                }, done);
        });
    });

    describe('when code has a logic error', () => {
        it('should return a error', (done) => {
            let code = `let a = {};
            function c() {
                a.b();
            };
            c()`;

            request(routes)
                .put('/functions/codes/crazy')
                .send({code})
                .expect('Content-Type', /json/)
                .expect(400, {
                    error: 'TypeError: a.b is not a function',
                    stack: 'at c (crazy.js:3)\nat crazy.js:5'
                }, done);
        });
    });

    describe('when code has a timeout error', () => {
        it('should return a error', (done) => {
            let code = 'while(1) {};';

            request(routes)
                .put('/functions/codes/timeout')
                .send({code})
                .expect('Content-Type', /json/)
                .expect(400, {
                    error: 'Error: Script execution timed out.',
                    stack: ''
                }, done);
        });
    });

    describe('when code is not a string', () => {
        it('should return a error', (done) => {
            let code = {wrong: 'yes'};

            request(routes)
                .put('/functions/codes/invalid')
                .send({code})
                .expect('Content-Type', /json/)
                .expect(400, {
                    error: 'Invalid instance',
                    details: [
                        'instance.code is not of a type(s) string',
                    ],
                }, done);
        });
    });
});
