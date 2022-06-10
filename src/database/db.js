const mysql = require('mysql');

const connection = mysql.createConnection({
 /*   host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE*/

    host: 'localhost',
    user: 'tickets_usr',
    password: 'Tickets&Usr3566',
    database: 'tickets_db'
});

connection.connect((error)=>{
    if(error){
        console.log('Error de conexion: '+ error);
        return;
    }
    console.log('Connection success');
});

module.exports = connection;