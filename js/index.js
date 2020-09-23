$(document).ready(async function() {
    function get_current_date(offset){
        let current_date = new Date(Date.now() - offset)
        current_date = [current_date.getFullYear(),
            ((current_date.getMonth() + 1)>9 ? '' : '0') + (current_date.getMonth() + 1),
            (current_date.getDate()>9 ? '' : '0') + current_date.getDate()
        ].join('-')
        return current_date
    }


    let $tasks = $('#all_tasks')

    let $input
    let $inline_input
    let $left_input
    let $change_button
    let $save_button

    let $task_form

    let click_counter = {}

    let current_date

    await $.ajax({
        url: '/tasks/get',
        method: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        success:function (data) {
            let tasks_info = data['tasks']


            for(const task of tasks_info){
                let responsible_user
                let creator
                for(const user of data['users']){
                    if(user['id'] === task['responsible_user_id']){
                        responsible_user = user
                    }
                    if(user['id'] === task['creator_id']){
                        creator = user
                    }
                }


                current_date = get_current_date(7*24*60*60*1000)
                let select_priority = []
                let select_state = []

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
                    select_state = ['selected="selected"', '', '', '']
                } else{
                    if(task['state'] === 'Выполняется'){
                        select_state = ['', 'selected="selected"', '', '']
                    } else{
                        if(task['state'] === 'Выполнена'){
                            select_state = ['', '', 'selected="selected"', '']
                        } else{

                            if(task['state'] === 'Отменена'){
                                select_state = ['', '', '', 'selected="selected"']
                            }
                        }
                    }
                }


                $tasks.append(`<div id="task_${task['id']}" class="task task_start">
        <form id="form_task_${task['id']}" class="task_form">
        <div class="inline_parameters">

            <div class="inline_labels">
                <label for="title_${task['id']}" class="inline_label">Заголовок</label>
                <label for="priority_${task['id']}" class="inline_label">Приоритет</label>
                <label for="end_date_${task['id']}" class="inline_label">Дата окончания</label>
                <label for="user_${task['id']}" class="inline_label">Ответсвенный</label>
                <label for="status_${task['id']}" class="inline_label">Статус</label>
            </div>

            <div class="inline_inputs">

                <input name="title" value="${task['title']}" type="text" class="input title inline_input input_disabled un_focused" id="title_${task['id']}"  required>

                <select name="priority" class="input inline_input input_disabled un_focused specific_select" id="priority_${task['id']}" required>
                    <option disabled>Выберите приоритет</option>
                    <option value="Высокий" ${select_priority[0]}>Высокий</option>
                    <option value="Средний" ${select_priority[1]}>Средний</option>
                    <option value="Низкий" ${select_priority[2]}>Низкий</option>
                </select>

                <input name="end_date" value="${task['end_date'].slice(0, 10)}" min="${current_date}" type="date" class="input inline_input input_disabled un_focused" id="end_date_${task['id']}" required>

                <input name="responsible_user_name" value="${responsible_user['name']+' '+responsible_user['surname']}" type="text" class="input inline_input input_disabled un_focused  disabled_forever" id="responsible_user_${task['id']}" >

                <select name="state" class="input inline_input input_disabled un_focused specific_select" id="state_${task['id']}" required>
                    <option disabled>Выберите статус</option>
                    <option value="К выполнению" ${select_state[0]}>К выполнению</option>
                    <option value="Выполняется" ${select_state[1]}>Выполняется</option>
                    <option value="Выполнена" ${select_state[2]}>Выполнена</option>
                    <option value="Отменена" ${select_state[3]}>Отменена</option>
                </select>

                <button type="button" class="change_button">Редактировать</button>

            </div>

        </div>

        <div class="left_parameters left_parameters_start">

            <div class="left_labels">
                <label for="creation_date_${task['id']}" class="left_label">Дата создания</label>
                <label for="update_date_${task['id']}" class="left_label">Дата обновения</label>
                <label for="creator_${task['id']}" class="left_label">Создатель</label>
                <label for="user_email_${task['id']}" class="left_label">Почта ответсвенного</label>
                <label for="description_${task['id']}" class="left_label">Описание</label>
            </div>

            <div class="left_inputs">
                <input name="creation_date" value="${task['creation_date'].slice(0, 10)}" type="date" class="input left_input un_focused input_disabled  disabled_forever" id="creation_date_${task['id']}">
                <input name="update_date" value="${task['update_date'].slice(0, 10)}" type="date" class="input left_input un_focused input_disabled  disabled_forever" id="update_date_${task['id']}">
                <input name="creator_name" value="${creator['name']+' '+creator['surname']}" type="text" class="input left_input un_focused input_disabled  disabled_forever" id="creator_${task['id']}">
                <input name="responsible_user_email" value="${responsible_user['login']}" type="email" class="input left_input un_focused input_disabled" id="user_email_${task['id']}" required>
                <textarea name="description" class="input description left_input un_focused input_disabled" id="description_${task['id']}" rows="2" cols="30" required>${task['description']}</textarea>
            
                <button type="submit" class="save_button" value="old ${task['id']} creator ${creator['id']}">Сохранить</button>

            </div>
            
        </div>
        <div class="request_result left_parameters_start">
            <span class="error error_start">У вас нет подчинённого с такой почтой</span>
        </div>

        </form>
    </div>`)
            }


            $input = $('.input')
            $change_button = $('.change_button')

            $task_form = $('.task_form')
            $save_button = $('.save_button')

            $inline_input = $('.inline_input')
            $left_input = $('.left_input')
        }
    })



    $input.on('focus', function (event) {
        $(this).removeClass('un_focused')
        $(this).addClass('focused')
    })

    $input.on('focusout', function (event) {
        $(this).removeClass('focused')
        $(this).addClass('un_focused')
    })

    $change_button.on('click', function () {
        let task = $(this).parents('.task')
        let left_parameters_div = $(this).parents('.inline_parameters').siblings('.left_parameters')
        let request_result = $(this).parents('.inline_parameters').siblings('.request_result')
        if(click_counter[$(this).val()] === undefined){
            click_counter[$(this).val()] = 1
        }
        if(click_counter[$(this).val()]%2 === 0) {
            click_counter[$(this).val()] = 0
            task.removeClass('task_not_folded')
            task.addClass('task_folded')

            left_parameters_div.removeClass('left_parameters_un_folded')
            left_parameters_div.addClass('left_parameters_folded')

            request_result.removeClass('left_parameters_un_folded')
            request_result.addClass('left_parameters_folded')

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

            request_result.removeClass('left_parameters_start')
            request_result.removeClass('left_parameters_folded')
            request_result.addClass('left_parameters_un_folded')

            $inline_input.removeClass('input_disabled')
            $inline_input.addClass('input_enabled')

            $left_input.removeClass('input_disabled')
            $left_input.addClass('input_enabled')
        }
        click_counter[$(this).val()] += 1
    })

    $task_form.on('submit', function(e){
        e.preventDefault()
        let $save_button = $(this).children('.left_parameters').children('.left_inputs').children('.save_button')
        let $error = $(this).children('.request_result').children('.error')

        if(!$error.hasClass('error_start')){
            $error.removeClass('error_active')
            $error.addClass('error_inactive')
        }

        let new_update_date = get_current_date(0)

        let old = $save_button.val().slice(0, 3) === 'old'
        let creator_id = $save_button.val().slice(-1)
        console.log(creator_id)

        let details = $(this).serialize()



        $.ajax({
            url: '/task/submit',
            method: 'GET',
            data: details+'&old='+JSON.stringify(old)+'&creator_id='+JSON.stringify(creator_id)+'&new_update_date='+JSON.stringify(new_update_date),
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                console.log(data)
                if(data['result'] === 'not_existing_user_email'){
                    $error.text('Пользователя с такой почтой не существует')
                    $error.removeClass('error_start')
                    $error.addClass('error_active')
                }
                if(data['result'] === 'not_existing_user_director_connection'){
                    $error.text('У вас нет подчинённого с такой почтой')
                    $error.removeClass('error_start')
                    $error.addClass('error_active')
                }
            }
        })

    })


})