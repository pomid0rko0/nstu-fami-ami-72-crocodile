var name;
$(document).on("click", "#DelBtn", function(){
    if($('#GameName').val()==""){
        $('#GameName').focus();
        return false;
    }
    name = $('#GameName').val();
    socket.emit("NewUserName", $('#GameName').val())
    $('#StartWindow').remove(); 
    socket.on('message', function(data) {
        $("#UsersAnswer").append(data)
    });
})
$('#UserMessage').keyup(function(event){
    if(event.keyCode == 13){
        event.preventDefault();
        var message = $('#UserMessage').val();
        socket.emit("NewMessage", message);
        $('#UserMessage').val("");
    }
});
$(document).on("click", "#SendUserMessage", function(){
    var message = $('#UserMessage').val();
    socket.emit("NewMessage", message);
    $('#UserMessage').val("");
});

$(document).on("click", "#IDraw", function(){
    $("#IDraw").remove()
    socket.emit("ChoiseDraw", "text");
});
socket.on('Success', (data) =>{
    alert("Игрок '"+data+"' Угадал слово!")
});
socket.on('SendWord', (data) =>{
    alert(data)
});
socket.on('NewUserMessage', (data) =>{
    $("#UsersAnswer").append(data.name+":"+data.sms+"\n")
});
socket.on('ShowBtn', (data) =>{
    //$("#IDraw").show()
    $("#ClearBtn").show()
    $(".ColorBtn").show()
});
socket.on('DelBtn', (data) =>{
    $("#IDraw").hide()
    $("#ClearBtn").hide()
    $(".ColorBtn").hide()
});
var DrawAbility = "false";
var ColorChange;
var testClick = 0; 
socket.on('TTT', (data) =>{
    $("#UserMessage").attr("disabled", true);
    if(name === data){
            var socket = io();
            function test() {
                document.getElementById("myCanvas").width = document.getElementById("myCanvas").width;
            }
            var canvas = document.getElementById("myCanvas"),
                context = canvas.getContext("2d"),
                w = canvas.width,
                h = canvas.height;

            var mouse = {
                x: 0,
                y: 0
            };

            var draw = false;
            socket.on("ChangeColor", (data)=>{
                context.strokeStyle = data
                ColorChange = data
            })          
            socket.on("DrawUserMouseDown", (data)=>{
                context.strokeStyle = ColorChange
                mouse.x = data.x;
                mouse.y = data.y;
                context.beginPath();
                context.moveTo(mouse.x, mouse.y);
            })
            socket.on("DrawUserMouseMove", (data)=>{
                context.strokeStyle = ColorChange
                mouse.x = data.x;
                mouse.y = data.y;
                context.lineTo(mouse.x, mouse.y);
                context.stroke();
            })
            socket.on("DrawUserMouseUp", (data)=>{
                context.strokeStyle = ColorChange
                mouse.x = data.x;
                mouse.y = data.y;
                context.lineTo(mouse.x, mouse.y);
                context.stroke();
            })
            $("#myCanvas").on("mousedown", function (e) {
                mouse.x = e.pageX - this.offsetLeft;
                mouse.y = e.pageY - this.offsetTop;
                draw = true;
                context.beginPath();
                context.moveTo(mouse.x, mouse.y);
                socket.emit("DrawMouseDown", {X:mouse.x,Y:mouse.y})
            });
            $("#myCanvas").on("mouseout", (e)=>{
                draw = false;
            })
            $(".ColorBtn").on("click",()=>{
                context.strokeStyle = event.target.id
                socket.emit("UserChangeColor", context.strokeStyle)
            })
            $("#myCanvas").on("mousemove",function (e) {
                if (draw == true) {
                    mouse.x = e.pageX - this.offsetLeft;
                    mouse.y = e.pageY - this.offsetTop;
                    context.lineTo(mouse.x, mouse.y);
                    context.stroke();
                    socket.emit("DrawMouseMove", {X:mouse.x,Y:mouse.y})
                }
            });
            $("#myCanvas").on("mouseup",function (e) {
                mouse.x = e.pageX - this.offsetLeft;
                mouse.y = e.pageY - this.offsetTop;
                context.lineTo(mouse.x, mouse.y);
                context.stroke();
                socket.emit("DrawMouseUp", {X:mouse.x,Y:mouse.y})
                draw = false;
            });
        }
        else{
            $("#UserMessage").attr("disabled", false);
            $("#myCanvas").off("mousedown")
            $("#myCanvas").off("mousemove")
            $("#myCanvas").off("mouseup")
        }
});