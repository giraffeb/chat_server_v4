module.exports = function(wrap, ori_root_dirname){
    let path = require('path');
    let root_dirname = ori_root_dirname+'/server';
    let express =require('express')
    let app = express();
    let cookieparser = require('cookie-parser');
    let jwt = require(root_dirname+'/util/jwt');
    let cors = require('cors');
    
    app.use(cors());
    app.use(express.static(path.join(ori_root_dirname, 'build')));
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(cookieparser());

    //TODO: 로긴처리 부분 리액트 앱 완성 후 적용하기.
    app.use(function(req,res,next){
        let chatv2 = req.cookies.chatv2;
        let result;
        try{
            result = jwt.verifyToken(chatv2);
        }catch(e){
            console.log('##wt verifying failed');
            console.log(e);
            
            return res.redirect('/');
        }
        

        console.log('cookie check->', result);
        next();
       
    });

    let default_router = require('./router/default_router')(app, wrap, root_dirname);
    
    app.use(function(err, req, res, next){
        console.log("< Error Handler >")
        console.log(err);
        res.json(err);
    });

    

    return app;
}