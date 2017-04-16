var chai = require('chai');
let expect = chai.expect;


describe("Controller", () => {
    const Controller = require('../');
    let controller = new Controller();

    it("should return express handler", () => {
        let handler = controller.handler();
        expect(handler).be.a('function');
    })


});