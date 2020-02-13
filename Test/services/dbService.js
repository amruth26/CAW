"use strict";
var async = require("async");
const JWT = require('jsonwebtoken');
var jwtsecret = "xxxxx.yyyyy.zzzzz";
var md5 = require('md5')
var connection = require('./../services/mongoDB')
var ConnectToDatabase = async function () {
    try {
        (
            db = await connection.GetConnection());
    } catch (e) {
        console.error("unable to connect to databases ", e);
        //TODO: SENDING EMAIL ON MONGO ERROR  
        setTimeout(() => {
            ConnectToDatabase();
        }, 1000)
    }
}
ConnectToDatabase();
module.exports = {
    signUp: function (req, res) {
        console.log("in req", req.body)
        var name = req.body.name != undefined ? req.body.name : '';
        var email = req.body.email != undefined ? req.body.email : '';
        var pass = req.body.password != undefined ? req.body.password : '';
        var phone = req.body.phone != undefined ? req.body.phone : '';

        var data = {
            "name": name,
            "email": email,
            "password": md5(pass), // password encryption
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

    },


    login: function (req, res) {
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
                if (err) {
                    res.send({ "status": "error", "message": "Error while login", "status_code": "DBERR" });
                }
                else if (userDetails && userDetails.length > 0) {
                    console.log(userDetails, md5(pass))
                    let user = userDetails[0]
                    if (user.password == md5(pass)) {
                        user = JSON.parse(JSON.stringify(user));
                        let token = JWT.sign(user, jwtsecret); // Token to send in headers for every request for authentication
                        return res.send({ "status": "success", "message": "User Logged in successfully", "data": { "token": token }, "status_code": "LOGINSUCCESS" })
                    }
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


    },


    getMovies: function (req, res) {
        let city = req.body.city != undefined ? req.body.city : '';
        if (city != undefined && city.length > 0) {
            let findObject = {
                "city": city
            }
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

        } else {
            res.send({ "status": "error", "message": "Mandatory fields are missing !!", "status_code": "USERDETAILS" });
        }

    },


    getTheatres: function (req, res) {
        let movie_id = req.body.movie_id != undefined ? req.body.movie_id : '';
        if (movie_id != undefined && movie_id.length > 0) {
            let findObject = {
                "movie_id": movie_id,
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

    },


    getSeating: function (req, res) {
        let movie_id = req.body.movie_id != undefined ? req.body.movie_id : '';
        let theatre_id = req.body.theatre_id != undefined ? req.body.theatre_id : '';
        let show_time = req.body.show_time != undefined ? req.body.show_time : '';
        let screen_number = req.body.screen_number != undefined ? req.body.screen_number : '';
        if (movie_id && theatre_id && show_time && screen_number) {
            let findObject = {
                "movie_id": movie_id,
                "theatre_id": theatre_id,
                "show_time": show_time,
                "screen_number": screen_number
            }
            console.log(findObject)
            // Movie_shows collection will have the seating details of that theatre with theatre id and movie details.
            db.collection('Movie_Seating').find(findObject).toArray(function (err, seatingDetails) {
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

    },


    bookSeats: function (req, res) {
        let movie_id = req.body.movie_id != undefined ? req.body.movie_id : '';
        let seat_numbers = req.body.seat_numbers != undefined ? req.body.seat_numbers : '';
        let theatre_id = req.body.theatre_id != undefined ? req.body.theatre_id : '';
        let show_time = req.body.show_time != undefined ? req.body.show_time : '';
        let screen_number = req.body.screen_number != undefined ? req.body.screen_number : '';
        let user_id = req.body.user_id != undefined ? req.body.user_id : '';
        if (movie_id && theatre_id && seat_numbers) {
            seat_numbers.forEach( async  (element, i) => {
                let findObject = {
                    "movie_id": movie_id,
                    "theatre_id": theatre_id,
                    "show_time": show_time,
                    "screen_number": screen_number,
                    "seat.number": element,
                }
                let updateObject = {
                    $set: {
                        "seat.status": 1,
                        "seat.user_id": user_id
                    }
                }
                let seats = [];
                // Movie_shows collection will have the seating details of that theatre with theatre id and movie details.
                let seatBooked = await db.collection('Movie_shows').update(findObject, updateObject);
                seats.push(seatBooked)
                if (i === (seat_numbers.length - 1)) {
                        res.send({ "status": "success", "message": "successfully  booked tickets",  "status_code": "SUCCESS" })
                        // seats status changed to booked
                    }
                
            });

        } else {
            res.send({ "status": "error", "message": "Mandatory fields are missing !!", "status_code": "PARAMS" });
        }

    }





}








