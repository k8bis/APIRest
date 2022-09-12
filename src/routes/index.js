const express = require('express');
const router = express.Router();
const connection = require('../database/db');
const bcryptjs = require('bcryptjs');
const transporter = require('../email/index');
var cors = require ('cors');
const { rollback } = require('../database/db');
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

router.get('/getTicketXId/:idticket',(req,res) => {
  var iduser = req.params.idticket;
  const query = "CALL getTickets(?);";

  connection.query(query,[iduser],(error,results)=>{
    if(error){
      console.log(error);
    }else{
      res.json(results);
    }
  })
});

router.get( '/addUpdateUsers', async( req, res ) =>{
  var {idusers, email, nombres, idroles, pass } = req.query;

  let query = 'CALL getCatUsuarios( 0, ? );';
  //si esta en 0 el id, es nuevo y no necesita validar la contraseña
  if( ! idusers == 0){
    connection.query( query,[email], async(error,result) => {
      const infoUser = result[0];
      if(error === null&&(infoUser[0].idusers > 0)){
        if ( ! await bcryptjs.compare( pass, infoUser[0].pass ) ){
          res.json({result:'no coincide la contraseña'});
        }
      }else{
        res.json({result:'no hay usuario'});    
      };
    }); 
  };

  //existe el usuario y coincide su contraseña, actualizamos la informacion
  query = 'CALL userUpdateOrInsert( ?, ?, null, null, null );';

  connection.query(query,[ idusers, nombres],async(error, results)=>{
    if(error){
      res.json({
        result: error,
        idusers: -1
      });
    }else{
      const result = results[0];

      var { iduser } = result[0];

      contentHTML = `<h1>Alta / Modificacion de Usuario</h1>
      <p>Te damos la bienvenida al <a href='${process.env.SERVER_APP}'>Sistema de tickets RodelSoft.</a></p>
      <ul>
        <li>Nombre: ${nombres}</li>
          <li>Usuario: ${email}</li>
          <li>Contraseña: ${pass}</li>
      </ul>
      <p>Recuerda que la cuenta es personal e intransferible y es responsabilidad del dueño el uso de este en la plataforma.</p>`;

/*      let info = await transporter.sendMail({
        from: "'RodelSoft Tickets' <" + process.env.EMAIL_AUTH_USER + ">",
        to: email,
        subject: 'Alta / Modificacion Usuarios',
        html: contentHTML
      }); 
*/
      res.json({
        result: 'ok',
        idUser: iduser
      }); 

    }
  });

});

router.get( '/addUpdateTickets', async( req, res ) => {
  var {idTicket,ticketDescripcion,idUserAlta,idUserAsignado,ticketCierre} = req.query;
  
  const query = "CALL ticketsUpdateOrInsert(?,?,?,?,?);";

  connection.query(query,[idTicket,ticketDescripcion,idUserAlta,idUserAsignado,ticketCierre],async(error,results)=>{
    if(error){
      res.json({
                result: error,
                idticket: -1
              });
    }else{
      const result = results[0];

      var {idticket, fechaAlta, Descripcion, Observaciones, usuarioAlta, emailAlta, usuarioCierre, emailCierre,estatus} = result[0];

      //console.log(result[0]);

      var emailTo = emailAlta; 

      if (estatus === 0){
        //enviar correo con los comentarios de Alta
        contentHTML = `
          <H1> Informacion de Ticket ${idticket}</H1>
          <p>Le informamos que se dio de alta el siguiente ticket:</p>
          <ul>
            <li>No. Ticket: ${idticket} </li>
            <li>Fecha Alta: ${fechaAlta} </li>
            <li>Usuario Alta: <a href="mailto:${emailAlta}">${usuarioAlta}</a> </li>
            <li>Descripcion: ${Descripcion} </li>
          </ul>
          <p>Usuario que atiende: <a href="mailto:${emailCierre}">${usuarioCierre}</a></p>`;
       
        subject = 'Alta TICKET ' + idticket;

        emailTo += ',' + emailCierre;
      };
      if (estatus === 1){
        //enviar correo con los comentarios de cierre
        contentHTML = `
          <H1> Informacion de Ticket ${idticket}</H1>
          <p>Le informamos que su ticket fue atendido de manera satisfactoria.</p>
          <ul>
            <li>No. Ticket: ${idticket} </li>
            <li>Fecha Alta: ${fechaAlta} </li>
            <li>Descripcion: ${Descripcion} </li>
          </ul>
          <p>Observaciones de cierre: ${Observaciones}</p>
          <p>Usuario que atendio: <a href="mailto:${emailCierre}">${usuarioCierre}</a></p> `;
        
        subject = 'Cierre TICKET ' + idticket;

      };

      let info = await transporter.sendMail({
        from: "'RodelSoft Tickets' <" + process.env.EMAIL_AUTH_USER + ">",
        to: emailTo,
        subject: subject,
        html: contentHTML
      });

      //console.log(info.messageId);

      res.json({
        result: 'ok',
        idTicket: idticket
      }); 
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
          res.json({estatus: 'no existe'});
        }else{
          res.json(results[0])  ;              
        }
      }
  })

});

router.get('/forgotPassword/:idusers', async(req,res) =>{
  const query = 'CALL userUpdateOrInsert( ?, null, null, null,?);';
  const idusers = req.params.idusers;
  //const newPassword = generateRandomString(5);
  const newPassword = '1234';
  const passwordHaash = await bcryptjs.hash(newPassword, 8 );

  connection.query(query,[idusers,passwordHaash], async(err,results)=>{
    if(!err){
      const objetoRecopilado = results[0];
      const email = objetoRecopilado[0].email;

      contentHTML = `
        <H1> Informacion de usuario</H1>
        <ul>
          <li>Email: ${email} </li>
          <li>Contraseña Temporal: ${ newPassword } </li>
        </ul>
        <p>Se solicito el cambio de su contraseña al <a href='${process.env.SERVER_APP}'>Sistema de tickets RodelSoft.</a> Recuerda que por seguridad es recomendable que cambies tu contraseña inmediatamente.</p>`;

      let info = await transporter.sendMail({
        from: "'RodelSoft Tickets' <" + process.env.EMAIL_AUTH_USER + ">",
        to: email,
        subject:'Recupera tu contraseña',
        html: contentHTML
      });

      console.log('Message sent: %s', info.messageId);
      res.json('[{estatus: enviado}]');
    };
  });
});

router.get('/authentication/:user&:pass',async( req, res ) => {
  const user = req.params.user;
  const pass = req.params.pass;
  //async traemos informacion del usuario capturado
  const query = "CALL getCatUsuarios(0,?);";
  //validamos si existe usuario
  connection.query( query,[user], async(error,result) => {
    const infoUser = result[0];
    if(error === null&&(infoUser[0].idusers > 0)){
      if ( await bcryptjs.compare( pass, infoUser[0].pass ) ){
        res.json({iduser: infoUser[0].idusers,
                  nombre: infoUser[0].nombres,
                  idrol: infoUser[0].idroles,
                  estatus: infoUser[0].estatus});
      }else{
        res.json({estatus: 'No coincide la contraseña.'});
      };
    }else{
      res.json({estatus: 'No existe el usuario registrado.'});
    }
  });
});

module.exports = router;