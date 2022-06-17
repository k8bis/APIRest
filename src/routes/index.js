const express = require('express');
const router = express.Router();
const connection = require('../database/db');
const nodemailer = require('nodemailer');
const bcryptjs = require('bcryptjs');
const transporter = require('../email/index');

var cors = require ('cors');
const { parse } = require('dotenv');
router.use(cors());

const  generateRandomString = (num) => {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result1= ' ';
  const charactersLength = characters.length;
  for ( let i = 0; i < num; i++ ) {
      result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result1;
};

//routes
router.get('/', (req, res) => {
    res.json({"Title" : "Hello World"});
});

router.get('/ticketsXUsuario/:id', (req, res) => {
  var id = req.params.id;
  const query = "CALL getInfoTicketsXUsuario(?);";

    connection.query(query,[id],(error,results)=>{
        if(error){
            console.log(error);
        }else{
          res.json(results[0])  ;              
        }
    })

});

router.get('/getCatUsuarios', (req, res) => {
  const query = "CALL getCatUsuarios(?,?);";

    connection.query(query,[null,null],(error,results)=>{
        if(error){
            console.log(error);
        }else{
          if (results[0].length == 0){            
            res.send('no existe')  ; 
          }else{
            res.json({users: results[0]})  ;              
          }             
        }
    })

});

router.get('/getCatUsuarios/:id&:email', (req, res) => {
  const idusers = req.params.id;
  const email = req.params.email;
  const query = "CALL getCatUsuarios(?,?);";

  connection.query(query,[idusers,email],(error,results)=>{
      if(error){
          console.log(error); 
      }else{
        if (results[0].length == 0){            
          res.send('no existe')  ; 
        }else{
          res.json({users: results[0]})  ;              
        }
      }
  })

});

router.get('/forgotPassword/:idusers', async(req,res) =>{
  const query = 'CALL userUpdateOrInsert( ?, null,null,null,?);';
  const idusers = req.params.idusers;
  //const newPassword = generateRandomString(5);
  const newPassword = '1234';
  const passwordHaash = await bcryptjs.hash(newPassword, 8 );

  connection.query(query,[idusers,passwordHaash], async(err,results)=>{
    if(!err){
      const objetoRecopilado = results[0];
      const email = objetoRecopilado[0].email;

     contentHTML = `
        <H1> User Information </H1>
        <ul>
          <li>Email: ${email} </li>
          <li>Contraseña Temporal: ${ newPassword } </li>
        </ul>
        <p>Se solicito el cambio de su contraseña al sistema de tickets RodelSoft. Recuerda que por seguridad es recomendable que cambies tu contraseña inmediatamente.</p>`;

      let info = await transporter.sendMail({
        from: "'RodelSoft Tickets' <jr.rodriguezd@hotmail.com>",
        to: email,
        subject:'RodelSoft Tickets Recupera tu contraseña',
        html: contentHTML
      });

      console.log('Message sent: %s', info.messageId);
      res.json('[{estatus: enviado}]');
    };
  });
});

module.exports = router;