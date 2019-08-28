let port = process.env.PORT || 8888;
let path = require('path');
let server_path = __dirname+'/server';
let wrap = require(server_path+'/util/async_wrap');


let app = require(server_path+'/web/web_config')(wrap, __dirname);
let http = require('http').createServer(app);
let db = require(server_path+'/db/config')();

let io = require(server_path+'/socket/socket_config')(http, wrap);

app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
  


http.listen(port, function(){
    console.log("server start port number ->", port);
})