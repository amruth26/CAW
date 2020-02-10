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
    if (name != undefined && email != undefined && pass != undefined && phone != undefined && name != '' && email != '' && pass != "" && phone != "") {
        db.collection('Users').find(findObject).toArray(function (err, existed) {
            console.log(existed)
            if (err) {
                throw err;
                console.log("Error Occured", err);
            }

            else if (existed && existed.length > 0) {
                console.log("Email already taken !!");
            }
            else {
                db.collection('Users').insertOne(data, function (err, collection) {
                    if (err)
                        throw err;
                    console.log("Record inserted Successfully");

                });
            }


        });
    } else {
        console.log("mandatory fields are missing");
    }




})




// app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

// app.get('/', function (req, res) {
//     res.set({
//         'Access-control-Allow-Origin': '*'
//     });
//     return res.redirect('index.html');
// })
app.listen(3000)


console.log("server listening at port 3000"); 
