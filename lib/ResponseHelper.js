'use strict';

/**
 * Emits response back to the browser
 * If express presence (check for express features), it will use it,
 */
class ResponseHelper {
    
    /**
     * @todo check if header is already sent
     * @param {*} response 
     * @param {*} data 
     */
    static async send(response, data) {
        // if promise is send, we will wait for resolve
        // this probably will be case for view/renering/async
        if(data instanceof Promise) {
            try {
                data = await data;
            } catch(err) {
                throw err; // throw back to controller
            }
            
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