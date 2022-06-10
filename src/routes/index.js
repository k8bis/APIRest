const express = require('express');
const router = express.Router();
const connection = require('../database/db');

var cors = require ('cors');
router.use(cors());

//routes
router.get('/', (req, res) => {
    res.json({"Title" : "Hello World"});
});

router.get('/test', (req, res) => {
  const query = "CALL getInfoTicketsXUsuario(5);";

    connection.query(query,(error,results)=>{
        if(error){
            console.log(error);
        }else{
          res.json(results[0])  ;              
        }
    })

});

router.get('/getCatUsuarios', (req, res) => {
  const query = "CALL getCatUsuarios;";

    connection.query(query,(error,results)=>{
        if(error){
            console.log(error);
        }else{
          console.log(results[0]);
          res.json({users: results[0]})  ;              
        }
    })

});

module.exports = router;