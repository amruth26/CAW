var databaseService = require('./services/dbService');
var authenticationUtils = require('./utils/AuthenticationUtils');
module.exports = function (app) {

    app.post('/login', databaseService.login);


    app.post('/sign-up', databaseService.signUp)


    app.post('/get-users', authenticationUtils.userAuthentication, databaseService.getUserDetails);

}