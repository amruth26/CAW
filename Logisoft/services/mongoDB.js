var MongoClient = require('mongodb').MongoClient;
let url = "mongodb://172.16.20.71:27017";
var GetConnection = function () {
    return new Promise(async function (resolve, reject) {
        try {
            MongoClient.connect(url, { useNewUrlParser: true }, function (err, database) {
                if (err) {
                    console.log(err);
                }
                if (!database) {
                    console.log("some thing went wrong at mongo connection");
                }
                else {
                    db = database.db('local');
                    console.log("mongo connection is successfull");
                    resolve(db)
                }
            })
        } catch (e) {
            reject(e);
        }
    })
}


module.exports = {
    GetConnection: GetConnection
}