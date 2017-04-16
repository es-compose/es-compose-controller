var chai = require('chai');
let expect = chai.expect;


describe("ActionResolver", () => {
    const ActionResolver = require('../lib/ActionResolver');
    let target = {
        doIndex() {

        },

        doGet() {
            
        }
    };
    

    let request = {
        path: '/some/where',
        method: 'get',
        params: {}
    }
    let resolver = new ActionResolver(target);

    describe("#parseParams", () => {
        it("should parse path and return", () => {
            expect(resolver.parseParams(request)).to.be.eql(['some', 'where'])
        })

        it("should update request.params", () => {
            expect(request.params).to.be.eql({0: 'some', 1: 'where'})
        })
    })

    describe("#resolveHandler", () => {
        it("should resolve to index method when method = GET and param = []", () => {
            expect(resolver.resolveHandler(target, 'get', null, [])).to.be.not.null;
        })

        it("should accurately return null when can't resolve", () => {
            expect(resolver.resolveHandler(target, 'put', null, ['abc'])).to.be.null;
        })
    })

});