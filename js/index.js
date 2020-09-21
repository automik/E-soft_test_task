$(document).ready(function() {
    let $input = $('input')
    let $inline_input = $('.inline_input')
    let $change_button = $('.change_button')
    let click_counter = 1
    $input.focus(function () {
        $(this).removeClass('un_focused')
        $(this).addClass('focused')
    })

    $input.focusout(function () {
        $(this).removeClass('focused')
        $(this).addClass('un_focused')
    })

        $change_button.on('click', function () {
            let task = $(this).parents('.task')
            let left_parameters_div = $(this).parents('.inline_parameters').siblings('.left_parameters')
            if(click_counter%2 === 0) {
                console.log('ddddouble')
                task.removeClass('task_not_folded')
                task.addClass('task_folded')

                left_parameters_div.removeClass('left_parameters_un_folded')
                left_parameters_div.addClass('left_parameters_folded')

                $inline_input.removeClass('input_enabled')
                $inline_input.addClass('input_disabled')
            } else{
                task.removeClass('task_start')
                task.removeClass('task_folded')
                task.addClass('task_not_folded')

                left_parameters_div.removeClass('left_parameters_start')
                left_parameters_div.removeClass('left_parameters_folded')
                left_parameters_div.addClass('left_parameters_un_folded')

                $inline_input.removeClass('input_disabled')
                $inline_input.addClass('input_enabled')
            }
            click_counter += 1
        })


})