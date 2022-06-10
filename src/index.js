const express = require('express');
const app = express();
const morgan = require('morgan');
const indexRoute = require('./routes/index');

//settings
app.set('port', process.env.port||3001);
app.set('json spaces',2);

//middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended : false}));
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

//routers
app.use(indexRoute);
app.use('/api',require('./routes/movies'));

// starting server 
var listener = app.listen(app.get('port'), function(){
    console.log('Listening on port ' + listener.address().port);
});