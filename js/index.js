$(document).ready(function() {
    let $tasks = $('#all_tasks')

    let $input = $('input')
    let $inline_input = $('.inline_input')
    let $left_input = $('.left_input')
    let $change_button = $('.change_button')
    let click_counter = {}

    $.ajax({
        url: '/tasks/get',
        method: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        success:function (data) {
            let tasks_info = data['tasks']


            for(const task of tasks_info){
                console.log(task['id'])
                let select_priority = []
                let select_status = []

                if(task['priority'] === 'Высокий'){
                    select_priority = ['selected="selected"', '', '']
                } else{
                    if(task['priority'] === 'Средний'){
                        select_priority = ['', 'selected="selected"', '']
                    } else{
                        if(task['priority'] === 'Низкий'){
                            select_priority = ['', '', 'selected="selected"']
                        }
                    }
                }

                if(task['state'] === 'К выполнению'){
                    select_status = ['selected="selected"', '', '', '']
                } else{
                    if(task['state'] === 'Выполняется'){
                        select_status = ['', 'selected="selected"', '', '']
                    } else{
                        if(task['state'] === 'Выполнена'){
                            select_status = ['', '', 'selected="selected"', '']
                        } else{

                            if(task['state'] === 'Отменена'){
                                select_status = ['', '', '', 'selected="selected"']
                            }
                        }
                    }
                }


                $tasks.append(`<div id="task_${task['id']+1}" class="task task_start">
        <form id="form_task_${task['id']+1}" class="task_form">
        <div class="inline_parameters">

            <div class="inline_labels">
                <label for="title_${task['id']+1}" class="inline_label">Заголовок</label>
                <label for="priority_${task['id']+1}" class="inline_label">Приоритет</label>
                <label for="end_date_${task['id']+1}" class="inline_label">Дата окончания</label>
                <label for="user_${task['id']+1}" class="inline_label">Ответсвенный</label>
                <label for="status_${task['id']+1}" class="inline_label">Статус</label>
            </div>

            <div class="inline_inputs">

                <input value="${task['title']}" type="text" class="title inline_input input_disabled un_focused" id="title_${task['id']+1}">

                <select class="inline_input input_disabled un_focused specific_select" id="priority_${task['id']+1}">
                    <option disabled>Выберите приоритет</option>
                    <option value="Высокий" ${select_priority[0]}>Высокий</option>
                    <option value="Средний" ${select_priority[1]}>Средний</option>
                    <option value="Низкий" ${select_priority[2]}>Низкий</option>
                </select>

                <input value="${task['end_date']}" type="date" class="inline_input input_disabled un_focused" id="end_date_${task['id']+1}">

                <input type="text" class="inline_input input_disabled un_focused" id="user_${task['id']+1}" disabled>

                <select class="inline_input input_disabled un_focused specific_select" id="status_${task['id']+1}">
                    <option disabled>Выберите статус</option>
                    <option value="К выполнению" ${select_status[0]}>К выполнению</option>
                    <option value="Выполняется" ${select_status[1]}>Выполняется</option>
                    <option value="Выполнена" ${select_status[2]}>Выполнена</option>
                    <option value="Отменена" ${select_status[3]}>Отменена</option>
                </select>

                <button type="button" class="change_button">Редактировать</button>

            </div>

        </div>

        <div class="left_parameters left_parameters_start">

            <div class="left_labels">
                <label for="creation_date_${task['id']+1}" class="left_label">Дата создания</label>
                <label for="update_date_${task['id']+1}" class="left_label">Дата обновения</label>
                <label for="creator_${task['id']+1}" class="left_label">Создатель</label>
                <label for="user_email_${task['id']+1}" class="left_label">Почта ответсвенного</label>
                <label for="description_${task['id']+1}" class="left_label">Описание</label>
            </div>

            <div class="left_inputs">
                <input value="${task['creation_date']}" type="date" class="left_input un_focused input_disabled" id="creation_date_${task['id']+1}">
                <input value="${task['update_date']}" type="date" class="left_input un_focused input_disabled" id="update_date_${task['id']+1}">
                <input type="text" disabled class="left_input un_focused input_disabled" id="creator_${task['id']+1}">
                <input type="email" class="left_input un_focused input_disabled" id="user_email_${task['id']+1}">
                <textarea class="description left_input un_focused input_disabled" id="description_${task['id']+1}" rows="2" cols="30">${task['description']}</textarea>
            </div>

        </div>
        </form>
    </div>`)
            }


            console.log(data)
            console.log(tasks_info)

            $change_button = $('.change_button')
        }
    })



    $input.focus(function () {
        $(this).removeClass('un_focused')
        $(this).addClass('focused')
    })

    $input.focusout(function () {
        $(this).removeClass('focused')
        $(this).addClass('un_focused')
    })

    $('body').on('click', function(event){
        let target = $(event.target)
        if(target.hasClass('change_button')){
            let task = target.parents('.task')
            let left_parameters_div = target.parents('.inline_parameters').siblings('.left_parameters')
            $inline_input = target.siblings('.inline_input')
            $left_input = target.parents('.inline_parameters').siblings('.left_parameters').children('.left_inputs').children('.left_input')
            if(click_counter[target.val()] === undefined){
                click_counter[target.val()] = 1
            }
            if(click_counter[target.val()]%2 === 0) {
                click_counter[target.val()] = 0
                task.removeClass('task_not_folded')
                task.addClass('task_folded')

                left_parameters_div.removeClass('left_parameters_un_folded')
                left_parameters_div.addClass('left_parameters_folded')

                $inline_input.removeClass('input_enabled')
                $inline_input.addClass('input_disabled')

                $left_input.removeClass('input_enabled')
                $left_input.addClass('input_disabled')
            } else{
                task.removeClass('task_start')
                task.removeClass('task_folded')
                task.addClass('task_not_folded')

                left_parameters_div.removeClass('left_parameters_start')
                left_parameters_div.removeClass('left_parameters_folded')
                left_parameters_div.addClass('left_parameters_un_folded')

                $inline_input.removeClass('input_disabled')
                $inline_input.addClass('input_enabled')

                $left_input.removeClass('input_disabled')
                $left_input.addClass('input_enabled')
            }
            click_counter[target.val()] += 1

        }
    })

    // $change_button.on('click', function () {
    //     console.log($('.change_button'))
    //     console.log($(this))
    //     let task = $(this).parents('.task')
    //     let left_parameters_div = $(this).parents('.inline_parameters').siblings('.left_parameters')
    //     if(click_counter[$(this).val()] === undefined){
    //         click_counter[$(this).val()] = 1
    //     }
    //     if(click_counter[$(this).val()]%2 === 0) {
    //         click_counter[$(this).val()] = 0
    //         task.removeClass('task_not_folded')
    //         task.addClass('task_folded')
    //
    //         left_parameters_div.removeClass('left_parameters_un_folded')
    //         left_parameters_div.addClass('left_parameters_folded')
    //
    //         $inline_input.removeClass('input_enabled')
    //         $inline_input.addClass('input_disabled')
    //     } else{
    //         task.removeClass('task_start')
    //         task.removeClass('task_folded')
    //         task.addClass('task_not_folded')
    //
    //         left_parameters_div.removeClass('left_parameters_start')
    //         left_parameters_div.removeClass('left_parameters_folded')
    //         left_parameters_div.addClass('left_parameters_un_folded')
    //
    //         $inline_input.removeClass('input_disabled')
    //         $inline_input.addClass('input_enabled')
    //     }
    //     click_counter[$(this).val()] += 1
    // })


})