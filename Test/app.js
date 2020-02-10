var express = require("express");
var bodyParser = require("body-parser");
var app = express();
const JWT = require('jsonwebtoken');
var jwtsecret = "xxxxx.yyyyy.zzzzz";
var MongoClient = require('mongodb').MongoClient;
var db;
createMongoConnection()
function createMongoConnection() {

    var url = "mongodb://localhost:27017/bookmyshow";
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, database) {
        if (err) {
            console.log(err);
        }
        if (!database) {
            console.log("some thing went wrong at mongo connection");
        }
        else {
            db = database.db('bookmyshow');
            console.log("mongo connection is successfull");
        }
    })
};
app.use(bodyParser.json());

app.post('/sign_up', function (req, res) {
    console.log("in req", req.body)
    var name = req.body.name != undefined ? req.body.name : '';
    var email = req.body.email != undefined ? req.body.email : '';
    var pass = req.body.password != undefined ? req.body.password : '';
    var phone = req.body.phone != undefined ? req.body.phone : '';

    var data = {
        "name": name,
        "email": email,
        "password": pass,
        "phone": phone
    }
    let findObject = {
        "email": email
    }
    if (name != undefined && email != undefined && pass != undefined && phone != undefined && name.length > 0 && email.length > 0 && pass.length  > 0 && phone.length > 0 ) {
        db.collection('Users').find(findObject).toArray(function (err, existed) {
            console.log(existed)
            if (err) {
                throw err;
                 res.send(""error,"Error while signup", "DBERR", 401);
            }

            else if (existed && existed.length > 0) {
                console.log("Email already taken !!");
                 res.send("error", "Email already taken !!", "EMILTAKEN", 402);

            }
            else {
                db.collection('Users').insertOne(data, function (err, collection) {
                    if (err){
                         throw err;
                          res.send("error", "Error while signup", "DBERR", 401);

                    }else{
                        res.send("success", "signedup successfully", 200);
                    }
                       
                });
            }
        });
    } else {
        res.send("error", "Mandatory fields are missing !!", "USERDETAILS", 501);
    }
    
});
    
    
    app.post('/login', function (req, res) {
    console.log("in req", req.body)
    
    var email = req.body.email != undefined ? req.body.email : '';
    var pass = req.body.password != undefined ? req.body.password : '';
    var data = {
        "email": email,
        "password": pass
    }
    let findObject = {
        "email": email
    }
    if (email != undefined && pass != undefined && email.length > 0 && pass.length > 0 ) {
        db.collection('Users').find(findObject).toArray(function (err, userDetails) {
            console.log(existed)
            if (err) {
                throw err;
                 res.send("error","Error while login", "DBERR", 401);
            }
            else if (userDetails && userDetails.length > 0) {
                if (userDetails.validPassword(password)) {
                     userDetails = JSON.parse(JSON.stringify(userDetails));
                     let token = JWT.sign(userDetails, jwtsecret); // Token to be stored in localstorage for authentication
                    return res.send("success", "User Logged in successfully", { "token": token }, "LOGINSUCCESS")
                } // Mongodb Method for validating password with encryted password which was stored at signup
                else{
                 res.send("error", "Inorrect password !!", "PWDERR", 402);
                }
            }
            else {
            return res.send("error","Email not Existed !!", "EMAILERR", 403);         
            }
        });
    } else {
       return res.send("error", "Mandatory fields are missing !!", "USERDETAILS", 501);
    }


})


app.post('/get-movies', userAuthentication,  fuction(req, res){
    let city = req.body.city != undefined ? req.body.city : '';
    if(city != undefined && city.length > 0){
          let findObject = {
              "city" : city
          }
          // Movies Collection will have the data of movies in that city
          db.collection('Movies').find(findObject).toArray(function (err, moviesDetails) {
            console.log(moviesDetails)
            if (err) {
                throw err;
                 res.send("error","Error while gettig movies", "DBERR", 401);
            }
            else if (moviesDetails && moviesDetails.length > 0) {
                     res.send("success","successfully  got movies list", { "movies": moviesDetails }, "SUCCESS");
                     // Movies Details which are showing in city
                }
            }
            else {
             res.send("error", "Email not Existed !!", "EMAILERR", 403);         
            }
         
    }else{
       res.send("error", "Mandatory fields are missing !!", "USERDETAILS", 501);
    }
         
 })
 
 
 app.post('/get-theatres', userAuthentication,  fuction(req, res){
    let movie_id = req.body.movie_id != undefined ? req.body.movie_id : '';
    if(movie_id != undefined && movie_id.length > 0){
          let findObject = {
              "movie_id" : movie_id
          }
          // Theatres collection will have the movie show time details which are playing in that theatre.
          db.collection('Theatres').find(findObject).toArray(function (err, theatreDetails) {
            console.log(theatreDetails)
            if (err) {
                throw err;
                 res.send("error","Error while gettig theatres", "DBERR", 401);
            }
            else if (theatreDetails && theatreDetails.length > 0) {
                     res.send("success","successfully  got theatres list", { "theatres": theatreDetails }, "SUCCESS")
                       // Theatre with movie show Details
                }
            }
            else {
             res.send("error", "No Theatres Found!!", "THEATREMPTY", 403);         
            }
         
    }else{
       res.send("error", "Mandatory fields are missing !!", "PARAMS", 501);
    }
         
 })
 
 
  app.post('/get-seats', userAuthentication,  fuction(req, res){
    let movie_id = req.body.movie_id != undefined ? req.body.movie_id : '';
    let theatre_id = req.body.theatre_id != undefined ? req.body.theatre_id : '';
    let show_time = req.body.show_time != undefined ? req.body.show_time : '';
    if(movie_id && theatre_id && show_time){
          let findObject = {
              "movie_id" : movie_id,
              "theatre_id" : theatre_id,
              "show_time" : show_time
          }
          // Movie_shows collection will have the seating details of that theatre with theatre id and movie details.
          db.collection('Movie_shows').find(findObject).toArray(function (err, seatingDetails) {
            console.log(theatreDetails)
            if (err) {
                throw err;
                 res.send("error","Error while gettig seatingDetails", "DBERR", 401);
            }
            else if (seatingDetails && seatingDetails.length > 0) {
                     res.send("success","successfully  got seatingDetails", { "seatingDetails": seatingDetails }, "SUCCESS")
                       // seating details as objects with status of the seat whether booked or not
                }
            }
            else {
             res.send("error", "No shows Found!!", "NOSHOW", 403);         
            }
         
    }else{
       res.send("error", "Mandatory fields are missing !!", "PARAMS", 501);
    }
         
 })
 
 
  app.post('/book-seats', userAuthentication,  fuction(req, res){
    let seat_numbers = req.body.seat_numbers != undefined ? req.body.seat_numbers : '';
    let theatre_id = req.body.theatre_id != undefined ? req.body.theatre_id : '';
    let show_time = req.body.show_time != undefined ? req.body.show_time : '';
    if(movie_id && theatre_id && seat_numbers){
          let findObject = {
              "movie_id" : movie_id,
              "theatre_id" : theatre_id,
              "show_time" : show_time
              "seats.seat_numbers" : {$in : seat_numbers},
              "seats.status" : 0
          }
          let updateObject = {
              $set : {
                  seats.status = 1 
              }
          }
          // Movie_shows collection will have the seating details of that theatre with theatre id and movie details.
          db.collection('Movie_shows').findAndUpdate(findObject, updateObject).toArray(function (err, bookingDetails) {
            console.log(theatreDetails)
            if (err) {
                throw err;
                 res.send("error","Error while booking", "DBERR", 401);
            }
            else if (bookingDetails && bookingDetails.length > 0) {
                     res.send("success","successfully  booked tickets", { "bookingDetails": bookingDetails }, "SUCCESS")
                       // seats status changed to booked
                }
            }
            else {
             res.send("error", "No seats Found!!", "NOSHOW", 403);         
            }
         
    }else{
       res.send("error", "Mandatory fields are missing !!", "PARAMS", 501);
    }
         
 })

 

 
 
                    
userAuthentication = function(api_request, api_response, next_service) {
    var authentication_token = api_request.headers['x-access-token'];
    if (authentication_token) {
        JWT.verify(authentication_token, jwtsecret, function(token_verify_error, token_data) {
            if (token_verify_error) {
                api_response.send("error", "User Authentiication failed", 401);
            }
             else if (token_data) {
                 next_service();

            } else {
                 api_response.send("error", "User Not Authorized", 504);
            }
        });

    } else {
            api_response.send("error", "Authentication token not found in request.", 402);

    }
};


app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(3000)


console.log("server listening at port 3000"); 
