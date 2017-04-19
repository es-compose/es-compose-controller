var chai = require('chai');
let expect = chai.expect;
const Controller = require('../');

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
    console.log('next called', args);
}

let context = {
    request : {
        method: 'get',
        url: '/',
        path: '',
        params: {}
    },
    response:  {
        send(content) {
            this.content = content;
        }
    },

    next: next
    
}


describe("Controller", () => {
    let controller = new Controller();
    let tc = new TestController();

    it("should return express handler", () => {
        let handler = controller.handler();
        expect(handler).be.a('function');
    })

    it("should handle simple return data", async function() {
        let result = await tc.invoke(context, next);
        expect(context.response.content).to.be.eq("Hello");
    })


    it("should handle promise return type", async () => {
        context.request.params['param'] = 'value';
        let result = await tc.invoke(context, next);
        expect(context.response.content).to.be.eq("Promised");
    })



});