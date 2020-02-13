
const JWT = require('jsonwebtoken');
var jwtsecret = "xxxxx.yyyyy.zzzzz";

var userAuthentication = function (api_request, api_response, next) {
    // console.log("in auth", api_request.headers)
    var authentication_token = api_request.headers['x-access-token'];
    if (authentication_token) {
        JWT.verify(authentication_token, jwtsecret, function (token_verify_error, token_data) {
            if (token_verify_error) {
                return api_response.send({ "status": "error", "message": "User Authentiication failed", "status_code": "USERUNAUTH" });
            }
            else if (token_data) {
                next();

            } else {
                return api_response.send({ "status": "error", "message": "User Not Authorized", "status_code": "USERUNAUTH" });
            }
        });

    } else {
        return api_response.send({ "status": "error", "message": "Authentication token not found in request.", "status_code": "USERUNAUTH" });

    }
};



module.exports = {
    userAuthentication: userAuthentication,
}
