$(function(){   
    $(document).on("click", "#DelBtn", function(){
        if($('#GameName').val()==""){
            $('#GameName').focus();
            return false;
        }
        
        $('#StartWindow').remove(); 
    })
})