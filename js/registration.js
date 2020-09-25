$(document).ready(function() {
    let incorrect_login = $('#login_incorrect')
    let incorrect_director_login = $('#director_login_incorrect')
    let $input = $('input')
    $input.focus(function(){
        $(this).removeClass('un_focused')
        $(this).addClass('focused')
        let label = $("label[for='" + $(this).attr('id') + "']");
        if($(this).val().length === 0) {
            label.removeClass('label_start')
            label.removeClass('label_of_un_focused')
            label.addClass('label_of_focused')
        }
    })

    $input.focusout(function (){
        $(this).removeClass('focused')
        $(this).addClass('un_focused')
        let label = $("label[for='" + $(this).attr('id') + "']");
        if($(this).val().length === 0) {
            label.removeClass('label_start')
            label.removeClass('label_of_focused')
            label.addClass('label_of_un_focused')
        }
    })

    $('#registration').on('submit', function(e){
        if(!incorrect_login.hasClass('error_start')){
            incorrect_login.removeClass('error_active')
            incorrect_login.addClass('error_inactive')
        }
        if(!incorrect_director_login.hasClass('error_start')){
            incorrect_director_login.removeClass('error_active')
            incorrect_director_login.addClass('error_inactive')
        }
        e.preventDefault()
        let details = $(this).serializeArray()
        $.ajax({
            url: '/registration/submit',
            method: 'POST',
            data:  JSON.stringify(details),
            dataType: 'json',
            contentType: 'application/json',
            success:function (data){
                if(data['result'] === 'existing_user'){
                    incorrect_login.removeClass('error_start')
                    incorrect_login.addClass('error_active')
                }
                if(data['result'] === 'not_existing_director'){
                    incorrect_director_login.removeClass('error_start')
                    incorrect_director_login.addClass('error_active')
                }
                if(data['result'] === 'successful'){
                    window.location.assign('/')
                }
                console.log(data)
            }
        })
    })

    $('#authorization').on('click', function(){
        window.location.assign('/authorization')
    })
})