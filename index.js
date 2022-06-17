
const dotenv = require('dotenv');
dotenv.config({path: './env/.env'});

const express = require('express');
const app = express();
const indexRoute = require('./src/routes/index');
const path = require('path');

//settings
app.set('port', process.env.port||3001);
app.set('json spaces',2);


//middlewares
app.use(express.urlencoded({extended : false}));
app.use(express.json());

//routers
app.use(indexRoute);

// starting server 
var listener = app.listen(app.get('port'), function(){
    console.log('Listening on port ' + listener.address().port);
});