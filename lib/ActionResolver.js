'use strict';

let {HttpError} = require("es-http");
const _ = require('lodash');

/**
 * ActionResolver
 * 
 * Resolve an action handler method/function name.
 * Provides configuraiton for customizing action name
 */
class ActionResolver
{
    constructor(target = null) {
        this.target = target;
        this.indexMethod = 'index';
        this.actionPrefix = 'do';
        this.actionSuffix = '';
        this.methods = {
            get: 'get',
            post: 'post',
            put: 'put',
            delete: 'delete'
        }
    }
    
    /**
     * Overriding the resolveHandler for routing restful actions
     * 
     * @todo revist logics and control flow of this method
     * @param {*} method 
     * @param {*} params 
     */
    resolve(request) {
        let target = this.target;
        let params = this.parseParams(request);
        let method = request.method.toLowerCase() 
        let restfulHandler, actionHandler;

        // first try resource based action handlers
        restfulHandler = this.resolveHandler(target, method, null, params);

        // ie, doGetUsers, doPostUsers
        let action = params.shift();
        actionHandler = this.resolveHandler(target, method, action, params);

        if(restfulHandler && actionHandler && (restfulHandler != actionHandler)) {
            throw new HttpError(404, `Cannot have both resource and action handlers: 
                                    ${restfulHandler.name} ${actionHandler.name}. Implement just one`);
        }

        if(actionHandler) {
            delete request.params[0]; // delete the param which used for routing
        }

        return restfulHandler || actionHandler || null;
    }

    /**
     * Generate action handler method name from given action + verb
     * @param {String} action 
     * @param {String} method 
     * @returns String
     */
    generateHandlerName(method = null, action = null) {
        let parts = [];
        if(method) {
            method = this.methods[method] || method;
            parts.push(method)
        }
        if(action) parts.push(action);

        if(this.actionPrefix) parts.unshift(this.actionPrefix);
        if(this.actionSuffix) parts.push(this.actionSuffix);

        return _.camelCase(parts.join('-'));
    }

    /**
     * 
     * @param {*} target 
     * @param {*} method 
     * @param {*} action 
     */
    resolveHandler(target, method, action, params) {
        let handler;

        // check special index method
        if(params.length == 0 && method.toLowerCase() == 'get') {
            handler = this.generateHandlerName(this.indexMethod, action);
            console.log(`Generated action name: ${handler}`, method, params);

            if(target[handler]) return target[handler];
        }

        // ie, doGet, doPost, etc.
        handler = this.generateHandlerName(method, action);
        console.log(`Generated action name: ${handler}`, method, params);

        if(target[handler]) return target[handler];
        
        return null;
    }

    /**
     * Parses the params from the URL path.
     * 
     * This method will also update the request.params if available
     * @param {*} request 
     */
    parseParams(request) {
        // parse the paths, action and params
        const path = request.path || request.url;
        let paths = path.split('/').filter( i => i.trim() != '');

        // add params to the request
        if(!request.params) request.params = {};
        if(paths.length) {
            paths.forEach( (value, index) => {
                request.params[index] = value;
            })
        }

        return Object.values(request.params);
    }

    /**
     * Verfiy handler params with request params
     * 
     * @todo support check for passing more then requested.
     * @param {*} handler 
     * @param {*} params 
     */
    validate(handler, params) {
        if(!handler) {
            throw new Error('Unable to resolve handler for the request.');
        }

        if(typeof handler !== 'function') {
            throw new Error(`Action handler ${handler} is not a function`);
        }

        if(handler.length > params.length) {
            throw new HttpError(404, `Action handler needs ${handler.length} params, got ${params.length}`);
        }
    }
}

module.exports = ActionResolver;