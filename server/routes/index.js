var express = require('express');
var app = express();

var path = require('path');
var bodyParser = require('body-parser');

var pg = require('pg');
var router = express.Router();

var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/weekend_04';

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({expanded: true}));

router.post('/messages', function(req,res){
    // pull the data off of the request
    var addMessage = {
        "name" : req.body.name,
        "message" : req.body.messageContent,
        "id" : req.body.id
    };

    pg.connect(connectionString, function (err, client) {

        client.query("INSERT INTO communications (name, message) VALUES ($1, $2) RETURNING id",
            [addMessage.name, addMessage.message],
            function(err, result) {
                if (err) {
                    console.log("Error inserting data: ", err);
                    //res.send(false);
                }

                res.send(addMessage);

            });

    });

});

router.get('/board', function(req, res){

    var results = [];

    pg.connect(connectionString, function(err, client, done){
        var query = client.query("SELECT * FROM communications ORDER BY name ASC");

        query.on('row', function(row){
            results.push(row);
        });

        query.on('end', function(){
            client.end();
            return res.json(results);
        });

        if (err){
            console.log("Error in board get request ", err);
        }
    });

});

router.delete('/delete', function(req, res){
    var messageID = req.body.id;

    pg.connect(connectionString, function (err, client){
        client.query("DELETE FROM communications WHERE id = $1", [messageID],
        function(err, result){
            if(err){
                console.log("Error deleting row: ", err);
                res.send(false);
            }
        });
    });
});

router.get("/admin", function(req,res){
    var file = req.params[0] || "/views/admin.html";
    res.sendFile(path.join(__dirname, "../public", file));
});

router.get("/*", function(req,res){
    var file = req.params[0] || "/views/index.html";
    res.sendFile(path.join(__dirname, "../public", file));
});


module.exports = router;