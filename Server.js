var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
const port = 5000;
app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname+  "/static", 'index.html'));
});

server.listen(port, function() {
    console.log('Запускаю сервер на порте 5000');
});
var players = {};
var WordsToPlay = ["Крокодил", "Яблоко", "Груша", "Слива", "Йод", "Йог"];

var AlreadyDraw,
DrawName,
Word,
WaitNewUser = false,
Coordinates = [];

function randomInteger(min, max) {
    let rand = min + Math.random() * (max - min);
    return Math.round(rand);
}
io.on('connection', function(socket) {
    socket.emit("IsUser", players)
    socket.on("NewUserName", function(name){
        players[socket.id] = {name:name, ability:"false"}
        io.sockets.emit("UserNamesList", players)
        io.sockets.emit('message', "В игру зашел новый игрок: "+name+"\n");
        socket.emit("Draw", Coordinates)

        if(WaitNewUser === true){
            WaitNewUser = false
            players[socket.id].ability = "true"
            io.sockets.emit("UserNamesList", players)
            io.sockets.emit("UserRemove");
            Word = randomInteger(0, WordsToPlay.length-1)
            socket.emit('SendWord',  WordsToPlay[Word])
            socket.emit("ShowBtn")
            socket.broadcast.emit("DelBtn", "Del");
            DrawName = players[socket.id].name
            io.sockets.emit('TTT', DrawName)
        }
    })
    
    socket.on("NewMessage", function(data){
        if(data.toLowerCase() == WordsToPlay[Word].toLowerCase() && players[socket.id].name != DrawName){
            for (let key in players) {
                if(players[key].name == DrawName){
                    players[key].ability = "false"
                }
            }
            players[socket.id].ability = "true"
            io.sockets.emit("UserNamesList", players)
            io.sockets.emit("UserRemove");
            Word = randomInteger(0, WordsToPlay.length-1)
            io.sockets.emit("Success",players[socket.id].name)
            socket.emit('SendWord',  WordsToPlay[Word])
            socket.emit("ShowBtn")
            socket.broadcast.emit("DelBtn", "Del");
            DrawName = players[socket.id].name
            io.sockets.emit('TTT', DrawName)
        }
        io.sockets.emit("NewUserMessage", {ability: players[socket.id].ability,name: players[socket.id].name, sms:data})
    })

    if(AlreadyDraw == "true")
    {
        socket.emit("DelBtn", "Del");
    }
    socket.on("ChoiseDraw", function(){
        DrawName = players[socket.id].name
        players[socket.id].ability = "true"
        io.sockets.emit("UserNamesList", players)
        socket.emit('TTT', DrawName);
        AlreadyDraw = "true";
        DrawId = socket.id
        Word = randomInteger(0, WordsToPlay.length-1)
        socket.emit('SendWord',  WordsToPlay[Word])
        socket.broadcast.emit("DelBtn", "Del");
    })
    
    socket.on("DrawMouseDown", function(data){
        io.sockets.emit("DrawUserMouseDown", {x:data.X, y:data.Y,color:data.color});
        Coordinates.push({x:data.X, y:data.Y, color:data.color})
    })
    socket.on("DrawMouseMove", function(data){
        io.sockets.emit("DrawUserMouseMove", {x:data.X, y:data.Y,color:data.color});
        Coordinates.push({x:data.X, y:data.Y, color:data.color})
    })
    socket.on("DrawMouseUp", function(data){
        io.sockets.emit("DrawUserMouseUp", {x:data.X, y:data.Y,color:data.color});
        Coordinates.push({x:data.X, y:data.Y, color:data.color, text:data.text})
    })
    socket.on("Remove", function(){
        Coordinates = []
        socket.broadcast.emit("UserRemove");
    })
    socket.on('disconnect', function() {
        if(players[socket.id] !== undefined){
            if(players[socket.id].name === DrawName && players[socket.id] !== undefined){
                delete players[socket.id]
                var NewDraw = Object.keys(players);
                if(players[NewDraw[0]] === undefined){
                    WaitNewUser = true
                }else{
                    players[NewDraw[0]].ability = "true"
                    DrawName = players[NewDraw[0]].name
                    io.sockets.sockets[NewDraw[0]].emit("ShowBtn")
                    socket.emit('SendWord',  WordsToPlay[Word])
                    io.sockets.emit('TTT', DrawName)
                    io.sockets.emit('message', "У рисующего игрока произошёл сбой, теперь рисующим стал "+players[NewDraw[0]].name+"\n");
                    io.sockets.emit("UserNamesList", players)
                }
            }
            else delete players[socket.id]
            io.sockets.emit("UserNamesList", players)
        }
    })
    
});

