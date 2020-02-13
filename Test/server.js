var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.json());

require('./routes')(app);

app.use(bodyParser.urlencoded({
    extended: true
}));

app.listen(3000);
console.log("server listening at port 3000");
module.exports = app;
