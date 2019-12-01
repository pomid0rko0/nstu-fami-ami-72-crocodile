var name, UserList, UserNames;
$(document).on("click", "#DelBtn", function(){
    if($('#GameName').val()==""){
        $('#GameName').focus();
        return false;
    }
    var check
    name = $('#GameName').val();
    for(key in UserList){
        if(name == UserList[key].name){
            alert("Введенное вами имя уже существует")
            check = "false"
            this.preventDefault()
        }
    }
    if(check != "false"){
        socket.emit("NewUserName", $('#GameName').val())
        $('#StartWindow').remove(); 
        socket.on('message', function(data) {
            $("#UsersAnswer").append(data)
        });
    }
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
socket.on("UserNamesList",(data)=>{
    $("#ListOfUsers").html("")
    $("#ListOfUsers").append("Список игроков:"+"\n")
    for(key in data){
        if(data[key].ability == "true"){
            $("#ListOfUsers").append("&#10017; " + data[key].name+"\n")
        }
        else $("#ListOfUsers").append(data[key].name+"\n")
    }
})
socket.on("IsUser",(data)=>{
    UserList = data
})
socket.on('Success', (data) =>{
    alert("Игрок '"+data+"' Угадал слово!")
});
socket.on('SendWord', (data) =>{
    alert(data)
});
socket.on('NewUserMessage', (data) =>{
    if(data.ability == "true"){
        $("#UsersAnswer").append("&#10017; " + data.name+":"+data.sms+"\n")
    }
    else $("#UsersAnswer").append(data.name+":"+data.sms+"\n")
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
    if(name === data){
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

            var draw = false, color;


            $("#myCanvas").on("mouseout", (e)=>{
                draw = false;
            })
            
            $(".ColorBtn").on("click",()=>{
                context.strokeStyle = event.target.id
                color = event.target.id
            })


            $("#myCanvas").on("mousedown", function (e) {
                mouse.x = e.pageX - this.offsetLeft;
                mouse.y = e.pageY - this.offsetTop;
                draw = true;
                socket.emit("DrawMouseDown", {X:mouse.x,Y:mouse.y,color:color})
            });
            $("#myCanvas").on("mousemove",function (e) {
                if (draw == true) {
                    mouse.x = e.pageX - this.offsetLeft;
                    mouse.y = e.pageY - this.offsetTop;
                    socket.emit("DrawMouseMove", {X:mouse.x,Y:mouse.y,color:color})
                }
            });
            $("#myCanvas").on("mouseup",function (e) {
               mouse.x = e.pageX - this.offsetLeft;
               mouse.y = e.pageY - this.offsetTop;
                socket.emit("DrawMouseUp", {X:mouse.x,Y:mouse.y,color:color, text:"space"})
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