var databaseService = require('./services/dbService');
var authenticationUtils = require('./utils/AuthenticationUtils');
module.exports = function (app) {

    app.post('/login', databaseService.login);


    app.post('/sign-up', databaseService.signUp)


    app.post('/get-movies', authenticationUtils.userAuthentication, databaseService.getMovies);


    app.post('/get-theatres', authenticationUtils.userAuthentication, databaseService.getTheatres)


    app.post('/get-seats', authenticationUtils.userAuthentication, databaseService.getSeating)


    app.post('/book-seats', authenticationUtils.userAuthentication, databaseService.bookSeats)

}