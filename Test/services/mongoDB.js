var MongoClient = require('mongodb').MongoClient;
let url = "mongodb://172.16.20.71:27017/bookmyshow";
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
                    db = database.db('bookmyshow');
                    console.log("mongo connection is successfull");
                    resolve(db)
                }
            })
        } catch (e) {
            reject(e);
        }
    })
}

var CloseConnection = function () {
    return (new Promise(async function (resolve, reject) {
        if (client && client.db) {
            console.log("closing db connection")
            try {
                await client.close();
                resolve("Closed db connection.")
            } catch (e) {
                reject("Unable to close db connection ", e)
            }
        } else {
            reject("DB connection is not available.")
        }
    }))
}

module.exports = {
    GetConnection: GetConnection
}