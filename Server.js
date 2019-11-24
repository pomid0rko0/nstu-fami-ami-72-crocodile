var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
app.set('port', 80);
app.use('/static', express.static(__dirname + '/static'));

// Маршруты
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname+  "/static", 'index.html'));
});

// Запуск сервера
server.listen(80, function() {
    console.log('Запускаю сервер на порте 80');
});
var players = [];
var WordsToPlay = ["Крокодил", "Яблоко", "Груша", "Слива", "Йод", "Йог"];
function randomInteger(min, max) {
    let rand = min + Math.random() * (max - min);
    return Math.round(rand);
  }
var AlreadyDraw;
var DrawName
var Word
var countOfUsers
io.on('connection', function(socket) {
    
    socket.on("NewUserName", function(name){
        
        players[socket.id] = name
        io.sockets.emit('message', "В игру зашел новый игрок: "+name+"\n");
        io.sockets.emit("DrawChoise", players[socket.id]);
    })
    
    socket.on("NewMessage", function(data){
        if(data == WordsToPlay[Word]){
            io.sockets.emit("UserRemove");
            Word = randomInteger(0, WordsToPlay.length-1)
            io.sockets.emit("Success",players[socket.id])
            socket.emit('SendWord',  WordsToPlay[Word])
            socket.emit("ShowBtn")
            socket.broadcast.emit("DelBtn", "Del");
            DrawName = players[socket.id]
            io.sockets.emit('TTT', DrawName)
        }
        io.sockets.emit("NewUserMessage", {name: players[socket.id], sms:data});
    })

    if(AlreadyDraw == "true")
    {
        socket.emit("DelBtn", "Del");
    }
    socket.on("ChoiseDraw", function(){
        DrawName = players[socket.id] 
        socket.emit('TTT', DrawName);
        AlreadyDraw = "true";
        DrawId = socket.id
        Word = randomInteger(0, WordsToPlay.length-1)
        socket.emit('SendWord',  WordsToPlay[Word])
        socket.broadcast.emit("DelBtn", "Del");
    })
    
    socket.on("UserChangeColor", function(data){
        socket.broadcast.emit("ChangeColor", data);
    })
    socket.on("DrawMouseDown", function(data){
        socket.broadcast.emit("DrawUserMouseDown", {x:data.X, y:data.Y});
    })
    socket.on("DrawMouseMove", function(data){
        socket.broadcast.emit("DrawUserMouseMove", {x:data.X, y:data.Y});
    })
    socket.on("DrawMouseUp", function(data){
        socket.broadcast.emit("DrawUserMouseUp", {x:data.X, y:data.Y});
    })
    socket.on("Remove", function(){
        socket.broadcast.emit("UserRemove");
    })
    socket.on('disconnect', function() {
        if(players[socket.id] === DrawName && players[socket.id] !== undefined){
            var deletedName = players[socket.id] 
            delete players[socket.id]
            var NewDraw = Object.keys(players);
            DrawName = players[NewDraw[0]]
            //io.sockets.sockets[NewDraw[0]].emit('SendWord',  WordsToPlay[Word])
            io.sockets.sockets[NewDraw[0]].emit("ShowBtn")
            io.sockets.emit('TTT', DrawName)
            io.sockets.emit('message', "У игрока "+ deletedName +" произошёл сбой, теперь рисующим стал "+players[NewDraw[0]]+"\n");
        }
        else delete players[socket.id]
    })
    
});

