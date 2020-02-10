var express = require("express");
var bodyParser = require("body-parser");
var app = express();
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
                return res.error("Error while signup", "DBERR", 401);
            }

            else if (existed && existed.length > 0) {
                console.log("Email already taken !!");
                return res.error("Email already taken !!", "EMILTAKEN", 402);

            }
            else {
                db.collection('Users').insertOne(data, function (err, collection) {
                    if (err){
                         throw err;
                         return res.error("Error while signup", "DBERR", 401);

                    }
                       
                });
            }
        });
    } else {
       return res.error("Mandatory fields are missing !!", "USERDETAILS", 501);
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
                return res.error("Error while login", "DBERR", 401);
            }
            else if (userDetails && userDetails.length > 0) {
                if (userDetails.validPassword(password)) {
                     userDetails = JSON.parse(JSON.stringify(userDetails));
                     let token = JWT.sign(userDetails, config.jwtsecret); // Token to be stored in localstorage for authentication
                    return res.success("User Logged isuccessfully", { "token": token }, "LOGINSUCCESS")
                } // Mongodb Method for validating password with encryted password which was stored at signup
                else{
                return res.error("Inorrect password !!", "PWDERR", 402);
                }
            }
            else {
            return res.error("Email not Existed !!", "EMAILERR", 403);         
            }


        });
    } else {
       return res.error("Mandatory fields are missing !!", "USERDETAILS", 501);
    }




})




app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(3000)


console.log("server listening at port 3000"); 
