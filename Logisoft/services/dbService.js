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
            db.collection('Users').find({findObject}).toArray(function (err, userDetails) {
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


    getUserDetails: function (req, res) {
        db.collection('Users').find({}).toArray(function (err, usersDetails) {
            console.log(usersDetails)
            if (err) {
                res.send({ "status": "error", "message": "Error while gettig users", "status_code": "DBERR" });
            }
            else if (usersDetails && usersDetails.length > 0) {
                res.send({ "status": "success", "message": "successfully  got users list", "data": { "movieuserss": usersDetails }, "status_code": "SUCCESS" });

            }
            else {
                res.send({ "status": "error", "message": "No Users Found !!", "status_code": "NOUSERS" });
            }
        });
    },

}








