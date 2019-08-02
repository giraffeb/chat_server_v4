let express = require('express');
let app = express();
let http = require('http').createServer(app);
var path = require('path');

app.use(express.static('build'));


http.listen(8888, function(){
    console.log('start server');
})