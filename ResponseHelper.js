'use strict';

/**
 * Emits response back to the browser
 * If express presence (check for express features), it will use it,
 */
class ResponseHelper {
    /**
     * @todo need some refactor and testing and logics
     * @param {any} data 
     * @param {int} status 
     * @param {Ojbect} headers 
     */
    static send(response, data) {
        // if promise is send, we will wait for resolve
        // this probably will be case for view/renering
        if(data instanceof Promise) {
            data.then(content => {
                this.send(content);
            });

            return; // callback will handle
        }

        switch(typeof data) {
            case 'object':
                response.setHeader('Content-Type', 'application/json');            
                response.write(JSON.stringify(data));
                break;
            
            default:
                response.setHeader('Content-Type',  'text/html');
                response.write(data);
        }

        response.end();
    }
}

module.exports = ResponseHelper;