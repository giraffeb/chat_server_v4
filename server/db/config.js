module.exports = function(){
    let mongoose = require('mongoose');
    
    
    let db = mongoose.connection;

    db.once('open', function(){
        console.log('db connect');
    })
    //mongodb+srv://soulgoon:<password>@cluster0-njgt7.azure.mongodb.net/test?retryWrites=true&w=majority
    mongoose.connect('mongodb+srv://hello:hello@cluster0-njgt7.azure.mongodb.net/',{dbName: 'chatv2'});
    // mongoose.connect('mongodb://localhost:/chatv2',{useNewUrlParser: true});
    return db;
}