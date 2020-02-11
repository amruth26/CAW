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
    if (name != undefined && email != undefined && pass != undefined && phone != undefined && name.length > 0 && email.length > 0 && pass.length > 0 && phone.length > 0) {
        db.collection('Users').find(findObject).toArray(function (err, existed) {
            console.log(existed)
            if (err) {
                res.send({ "status": "error", "message": "Error while signup", "status_code": "DBERR" });
            }

            else if (existed && existed.length > 0) {
                console.log("Email already taken !!");
                res.send({ "status": "error", "message": "Email already taken !!", "status_code": "EMILTAKEN" });

            }
            else {
                db.collection('Users').insertOne(data, function (err, collection) {
                    if (err) {

                        res.send({ "status": "error", "message": "Error while signup", "status_code": "DBERR" });

                    } else {
                        res.send({ "status": "success", "message": "signedup successfully", "status_code": "SUCCESS" });
                    }

                });
            }
        });
    } else {
        res.send({ "status": "error", "message": "Mandatory fields are missing !!", "status_code": "USERDETAILS" });
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
    if (email != undefined && pass != undefined && email.length > 0 && pass.length > 0) {
        db.collection('Users').find(findObject).toArray(function (err, userDetails) {
            console.log(existed)
            if (err) {

                res.send({ "status": "error", "message": "Error while login", "status_code": "DBERR" });
            }
            else if (userDetails && userDetails.length > 0) {
                if (userDetails.validPassword(password)) {
                    userDetails = JSON.parse(JSON.stringify(userDetails));
                    let token = JWT.sign(userDetails, jwtsecret); // Token to be stored in localstorage for authentication
                    return res.send({ "status": "success", "message": "User Logged in successfully", "data": { "token": token }, "status_code": "LOGINSUCCESS" })
                } // Mongodb Method for validating password with encryted password which was stored at signup
                else {
                    res.send({ "status": "error", "message": "Inorrect password !!", "status_code": "PWDERR" });
                }
            }
            else {
                return res.send({ "status": "error", "message": "Email not Existed !!", "status_code": "EMAILERR" });
            }
        });
    } else {
        return res.send({ "status": "error", "message": "Mandatory fields are missing !!", "status_code": "USERDETAILS" });
    }


})


app.post('/get-movies', userAuthentication, function (req, res) {
    // let city = req.body.city != undefined ? req.body.city : '';
    // if(city != undefined && city.length > 0){
    //       let findObject = {
    //           "city" : city
    //       }
    // Movies Collection will have the data of movies in that city
    db.collection('Movies').find(findObject).toArray(function (err, moviesDetails) {
        console.log(moviesDetails)
        if (err) {

            res.send({ "status": "error", "message": "Error while gettig movies", "status_code": "DBERR" });
        }
        else if (moviesDetails && moviesDetails.length > 0) {
            res.send({ "status": "success", "message": "successfully  got movies list", "data": { "movies": moviesDetails }, "status_code": "SUCCESS" });
            // Movies Details which are showing in city
        }

        else {
            res.send({ "status": "error", "message": "Email not Existed !!", "status_code": "EMAILERR" });
        }
    });

    // }else{
    //    res.send({"status" : "error", "message" : "Mandatory fields are missing !!", "status_code" : "USERDETAILS"});
    // }

});


app.post('/get-theatres', userAuthentication, function (req, res) {
    let movie_id = req.body.movie_id != undefined ? req.body.movie_id : '';
    if (movie_id != undefined && movie_id.length > 0) {
        let findObject = {
            "movie_id": movie_id
        }
        // Theatres collection will have the movie show time details which are playing in that theatre.
        db.collection('Theatres').find(findObject).toArray(function (err, theatreDetails) {
            console.log(theatreDetails)
            if (err) {

                res.send({ "status": "error", "message": "Error while gettig theatres", "status_code": "DBERR" });
            }
            else if (theatreDetails && theatreDetails.length > 0) {
                res.send({ "status": "success", "message": "successfully  got theatres list", "data": { "theatres": theatreDetails }, "status_code": "SUCCESS" })
                // Theatre with movie show Details
            }

            else {
                res.send({ "status": "error", "message": "No Theatres Found!!", "status_code": "THEATREMPTY" });
            }
        });

    } else {
        res.send({ "status": "error", "message": "Mandatory fields are missing !!", "status_code": "PARAMS" });
    }

})


app.post('/get-seats', userAuthentication, function (req, res) {
    let movie_id = req.body.movie_id != undefined ? req.body.movie_id : '';
    let theatre_id = req.body.theatre_id != undefined ? req.body.theatre_id : '';
    let show_time = req.body.show_time != undefined ? req.body.show_time : '';
    if (movie_id && theatre_id && show_time) {
        let findObject = {
            "movie_id": movie_id,
            "theatre_id": theatre_id,
            "show_time": show_time
        }
        // Movie_shows collection will have the seating details of that theatre with theatre id and movie details.
        db.collection('Movie_shows').find(findObject).toArray(function (err, seatingDetails) {
            console.log(seatingDetails)
            if (err) {

                res.send({ "status": "error", "message": "Error while gettig seatingDetails", "status_code": "DBERR" });
            }
            else if (seatingDetails && seatingDetails.length > 0) {
                res.send({ "status": "success", "message": "successfully  got seatingDetails", "data": { "seatingDetails": seatingDetails }, "status_code": "SUCCESS" })
                // seating details as objects with status of the seat whether booked or not
            }

            else {
                res.send({ "status": "error", "message": "No shows Found!!", "status_code": "NOSHOW" });
            }
        });

    } else {
        res.send({ "status": "error", "message": "Mandatory fields are missing !!", "status_code": "PARAMS" });
    }

})


app.post('/book-seats', userAuthentication, function (req, res) {
    let seat_numbers = req.body.seat_numbers != undefined ? req.body.seat_numbers : '';
    let theatre_id = req.body.theatre_id != undefined ? req.body.theatre_id : '';
    let show_time = req.body.show_time != undefined ? req.body.show_time : '';
    if (movie_id && theatre_id && seat_numbers) {
        let findObject = {
            "movie_id": movie_id,
            "theatre_id": theatre_id,
            "show_time": show_time,
            "seats.seat_numbers": { $in: seat_numbers },
            "seats.status": 0
        }
        let updateObject = {
            $set: {
                "seats.status": 1
            }
        }
        // Movie_shows collection will have the seating details of that theatre with theatre id and movie details.
        db.collection('Movie_shows').findAndUpdate(findObject, updateObject).toArray(function (err, bookingDetails) {
            console.log(bookingDetails)
            if (err) {

                res.send({ "status": "error", "message": "Error while booking", "status_code": "DBERR" });
            }
            else if (bookingDetails && bookingDetails.length > 0) {
                res.send({ "status": "success", "message": "successfully  booked tickets", "data": { "bookingDetails": bookingDetails }, "status_code": "SUCCESS" })
                // seats status changed to booked
            }
            else {
                res.send({ "status": "error", "message": "No seats Found!!", "status_code": "NOSHOW" });
            }
        });
    } else {
        res.send({ "status": "error", "message": "Mandatory fields are missing !!", "status_code": "PARAMS" });
    }

})






var userAuthentication = function (api_request, api_response, next_service) {
    var authentication_token = api_request.headers['x-access-token'];
    if (authentication_token) {
        JWT.verify(authentication_token, jwtsecret, function (token_verify_error, token_data) {
            if (token_verify_error) {
                api_response.send({ "status": "error", "message": "User Authentiication failed", "status_code": "USERUNAUTH" });
            }
            else if (token_data) {
                next_service();

            } else {
                api_response.send({ "status": "error", "message": "User Not Authorized", "status_code": "USERUNAUTH" });
            }
        });

    } else {
        api_response.send({ "status": "error", "message": "Authentication token not found in request.", "status_code": "USERUNAUTH" });

    }
};


app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(3000)


console.log("server listening at port 3000");

