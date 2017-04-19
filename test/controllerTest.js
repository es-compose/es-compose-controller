var chai = require('chai');
let expect = chai.expect;
const Controller = require('../');

class TestController extends Controller
{
    doIndex() {
        
    }
}


describe("Controller", () => {
    let controller = new Controller();

    it("should return express handler", () => {
        let handler = controller.handler();
        expect(handler).be.a('function');
    })


});