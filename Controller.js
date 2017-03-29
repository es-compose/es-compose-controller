'use strict';

let ActionResolver = require('./ActionResolver');
let ResponseHelper = require('./ResponseHelper');

/**
 * Restful Action Controller for Node +/ Express applications
 * 
 * Encapsulates all related restful actions in one single class
 * Also provides controller lifecycle for breaking codes into logical units
 */
class Controller
{
    /**
     * Initialize the controller
     */
    constructor() {
        this.resolver = new ActionResolver(this);
    }

    /**
     * request handler (nodejs) / Middleware (expressjs) wrapper function
     */
    static handler(context = null) {
        // return the callable wrapper to internal process method
        return (request, response, next = null) => {
            if(!context) { //
                context = new Object();
            }

            let instance = new this();

            context.request = request;
            context.response = response;
            context.next = next;
            instance.process(context);
        };
    }

    /**
     * @param {*} request 
     * @param {*} response 
     * @param {*} next 
     */
    process(context) {
        // the the currently processing context
        this.context = context;
        let request = context.request;
        let response = context.response;

        try {
            this.onInit(context);

            if(!this.resolver) {
                throw new Error("Action resolver is not found.");
            }

            let handler = this.resolver.resolve(request);

            let params = Object.values(request.params);
            params.unshift(context); // add the request and response object
            this.resolver.validate(handler, params);

            let result = Reflect.apply(handler, this, [...params]);

            if(result) {
                ResponseHelper.send(response, result);
            } else {
                // assume that response has been sent using explicit call to send/end.
            }

            this.onExit(context);   
        }
        
        catch(e) {
            this.onError(e, context);
        }
    }


    /**
     * Controller initialization method
     * This event is called before dispatching action to handler
     */
    onInit(context) {}


    /**
     * Controller exit method
     * 
     * This method is called after action handler has been executed 
     * and response has been sent 
     * @param {object} context application context
     */
    onExit(context) {}

    /**
     * Controller level error/exception handler
     * 
     * Override for providing custom error handler
     * Default implementation is to forward to next handler if part of middleware stack
     * If not simply re-throw the error
     * @param {*} error 
     * @param {object} context application context
     */
    onError(error, context) {
        throw error;
    }
}

module.exports = Controller;