$(document).ready(function() {
    let login = $('#login'), login_incorrect = $('#login_incorrect')
    let password = $('#password'), password_incorrect = $('#password_incorrect')
    let authorization_form = $('#authorization')

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

    $('#registration').on('click', function(){
        window.location.assign('/registration')
    })

    authorization_form.on('submit', function(e) {
        login_incorrect.animate({
            opacity: '-=100%'
        }, 300)
        password_incorrect.animate({
            opacity: '-=100%'
        }, 300)
        e.preventDefault()
        if((login.val() !== '') && (password.val() !== '')) {
            let details = authorization_form.serializeArray()
            $.ajax({
                url: '/authorization/submit',
                method: 'GET',
                data: details,
                dataType: 'json',
                contentType: 'application/json',
                success: function (data) {
                    if(data['result'] === 'wrong_email'){
                        login_incorrect.animate({
                            opacity: '+=100%'
                        }, 300)
                    }
                    if(data['result'] === 'wrong_password'){
                        password_incorrect.animate({
                            opacity: '+=100%'
                        }, 300)
                    }
                    if(data['result'] === 'successful'){
                        window.location.assign('/')
                    }
                }
            })
        }
    })
})