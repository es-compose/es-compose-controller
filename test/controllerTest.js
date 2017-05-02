var chai = require('chai');
let expect = chai.expect;
const Controller = require('../');
let http = require('node-mocks-http');

class TestController extends Controller
{
    doIndex() {
        return "Hello";
    }

    doGet(context, id) {
        return Promise.resolve('Promised');
    }
}

let next = function(...args) {
    console.log('next called');
}

let context = {
    request : http.createRequest({
        method: 'GET',
        url: '/',
        params: {}
    }),
    response:  http.createResponse(),
    next: next
}


describe("Controller", () => {
    let controller = new Controller();
    let tc = new TestController();

    // it("should return express handler", () => {
    //     let handler = controller.handler();
    //     expect(handler).be.a('function');
    // })

    it("should handle simple return data", async function() {
        context.response = http.createResponse();
        let result = await tc.invoke(context, next);
        expect(context.response._getData()).to.be.eq("Hello");
    })


    it("should handle promise return type", async () => {
        context.response = http.createResponse();
        context.request.params['param'] = 'value';
        let result = await tc.invoke(context, next);
        expect(context.response._getData()).to.be.eq("Promised");
    })


    // it("can using text() helper", () => {
    //     context.response = http.createResponse();
    //     tc.text('Hi!');
    //     expect(context.response._getData()).to.be.eq('Hi!');
    // })

});