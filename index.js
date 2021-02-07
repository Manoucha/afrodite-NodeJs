/*
Restful services by NodeJs
*/
var crypto  = require('crypto');
var uuid = require ('uuid');
var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

//connect to mysql
//usign pool

var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit:100,
  connectTimeout: 1000000,
  host:'127.0.0.1', //Replace your host IP
  user:'root',
  password:'root',
  database:'parfdb',
  socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
  port:'8888'

});


var app=express();
app.use(bodyParser.json()); //Accept JSON Params
app.use(bodyParser.urlencoded({extended: true})); //Accept URL Encoded params


//payer les cadeaux contre des points
app.get('/payercadeau/:idClient' , (req, res) => {
pool.getConnection(function(err, connection) {
  connection.query('update cadeaucommande SET etat = 2 WHERE idclient = ?',[req.params.idClient],(err, rows, fields) => {
  if (!err)
  {
  res.end(JSON.stringify(rows))
  console.log('cadeau payé avec points');
  }
  else
  console.log(err);
  })
  });
} );
//GET CADEAU OF CLIENT pas encore validé
app.get('/allcadeau/:idClient' , (req, res) => {
  pool.getConnection(function(err, connection) {
connection.query('SELECT * FROM cadeaucommande WHERE idClient=? and etat = 1',[req.params.idClient], (err, rows, fields) => {
if (!err)
{
  res.send(rows);
  console.log('cadeau : etat 1 , dans le panier');
}

else
console.log(err);
})

});
});
app.get('/login/:email/:password' , (req, res) => {
  pool.getConnection(function(err, connection) {
    connection.query('SELECT * FROM client_entity where email=? and password=?',[[req.params.email],[req.params.password]],(err, rows, fields) => {
    if (!err)
    {
      res.send(rows[0]);
    
    console.log('logged in');
    }
    else
    console.log(err);
    })
    });
  } );

app.get('/hello/' , (req, res) => {
  res.send("hello world");
  console.log('cadeau here');
} );

//ajouter cadeau dans le panier 
app.put('/ajoutercadeaupanier/:idClient/:idCadeau', function (req,res) {



  pool.getConnection(function(err, connection) {
   connection.query('INSERT INTO `cadeaucommande`(`idcadeau`, `idclient`, `quantite`, `etat`) VALUES (?,?,1,1)',[[req.params.idCadeau],[req.params.idClient]],(err, rows, fields) => {
   if (!err)
   {
   res.json('commandeproduit added successfully');
   console.log('commandeproduit added successfully');
   }
   else
   console.log(err);
   })
   });
 
  
    });
//echanger un cadeau contre des points 
app.put('/echanger/:idClient/:idCadeau/:quantite/:points', function (req,res) {



 pool.getConnection(function(err, connection) {
  connection.query('UPDATE cadeaucommande SET etat= 2 where idclient = ? and idcadeau = ?',[[req.params.idClient],[req.params.idCadeau]],(err, rows, fields) => {
  if (!err)
  {
  res.json('commandeproduit added successfully');
  console.log('commandeproduit added successfully');
  connection.query('UPDATE cadeau SET quantite= (`Quantite`-1) where NumCadeau = ?',[req.params.idCadeau], (err, rows, fields) => {
    if (!err)
    {
      //res.send(rows[0]);
      console.log('quantite  cadeau decremente avec succes ');
      connection.query('UPDATE client_entity SET nbPoint = (`nbPoint`- ? )  where codeClient= ?',[[req.params.points],[req.params.idClient]],function(err,result,fields){
        res.send(result[0]);
        console.log('point client decremente  avec succe ');
      });
    }
  
    else
    console.log(err);
  });
  return
  }

  });

 
});
});
//ALL cadeaux
app.get('/cadeaux/' , (req, res) => {
  pool.getConnection(function(err, connection) {
connection.query('SELECT * FROM cadeau where Quantite != 0 ',(err, rows, fields) => {
if (!err)
{
  res.send(rows);
  console.log('cadeaux here');
}
else
console.log(err);
})
});
} );
//cadeau client dans le panier
app.get('/cadeaux/:idClient' , (req, res) => {
  pool.getConnection(function(err, connection) {
connection.query('SELECT * FROM cadeaucommande c inner join cadeau cad ON c.idcadeau = cad.numcadeau where idClient = ? and etat = 1',[req.params.idClient],(err, rows, fields) => {
if (!err)
{
  res.send(rows);
  console.log('posts here');
}
else
console.log(err);
})
});
} );


app.listen(3010,()=>{
  console.log('Restful runnig on port 3010');
})
