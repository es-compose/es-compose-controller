'use strict';

const Middleware = require('es-http').Middleware;
const ActionResolver = require('./ActionResolver');

/**
 * Restful Action Controller for Node +/ Express applications
 * 
 * Encapsulates all related restful actions in one single class
 * Also provides controller lifecycle for breaking codes into logical units
 */
class Controller extends Middleware
{
    /**
     * Initialize the controller
     */
    constructor() {
        super();
        this.resolver = new ActionResolver(this);
    }

    /**
     * @param {*} request 
     * @param {*} response 
     * @param {*} next 
     */
    async invoke(context, next = null) {
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

            // handling the result
            // if no result is returned, assume response is handled by the action
            let result = Reflect.apply(handler, this, [...params]);
            if(result !== undefined) {
                if(result instanceof Promise) {
                    try {
                        result = await result;
                    } catch(err) {
                        // send it to error handler
                        return this.onError(err, context);
                    }
                }
                
                response.send(result);
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
    onError(error, { next }) {
        next(error);
    }
}

module.exports = Controller;