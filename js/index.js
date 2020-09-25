$(document).ready(async function() {
    function get_current_date(offset){
        return new Date(Date.now() - offset)
    }
    function get_date(date){
        return [date.getFullYear(),
            ((date.getMonth() + 1) > 9 ? '' : '0') + (date.getMonth() + 1),
            (date.getDate() > 9 ? '' : '0') + date.getDate()
        ].join('-')
    }


    let $tasks = $('#all_tasks')

    let $inline_input
    let $left_input
    let $save_button

    let group_type

    let $task_form
    let $new_task_button = $('#create_task')

    let max_id_count = 0

    let current_user

    await $.ajax({
        url: '/tasks/get',
        method: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        success:function (data) {
            let tasks_info = data['tasks']
            current_user = data['user']
            let group_type = data['group_type']
            let current_group
            let group_count = 0
            let $task_group
            console.log(data)
            console.log(typeof current_group, current_group)

            for(let task of tasks_info) {


                max_id_count += 1

                task['end_date'] = new Date(task['end_date'])
                task['creation_date'] = new Date(task['creation_date'])
                task['update_date'] = new Date(task['update_date'])

                // if(current_group === undefined){
                //     current_group = task[group_type]
                // }

                let responsible_user
                let creator
                for (const user of data['users']) {
                    if (user['id'] === task['responsible_user_id']) {
                        responsible_user = user
                    }
                    if (user['id'] === task['creator_id']) {
                        creator = user
                    }
                }
                if ((responsible_user['id'] === data['user']['id']) || (creator['id'] === data['user']['id'])) {

                    // let current_user_is_responsible = (responsible_user['id'] === data['user']['id'])
                    let current_user_is_creator = (creator['id'] === data['user']['id'])

                    let disabled_list = {'title': '', 'priority': '', 'end_date': '',
                                         'state': '', 'responsible_user_email': '', 'description': ''}

                    if (!current_user_is_creator) {
                        disabled_list = {
                            'title': 'disabled_forever', 'priority': 'disabled_forever', 'end_date': 'disabled_forever',
                            'state': '', 'responsible_user_email': 'disabled_forever', 'description': 'disabled_forever'
                        }
                    }


                    let select_priority = []
                    let select_state = []

                    let additional_class_inline = ''
                    let additional_class_task = ''

                    if ((task['state'] === 'Выполняется') || (task['state'] === 'К выполнению')) {
                        if (get_current_date(0) > task['end_date']) {
                            additional_class_inline = 'inline_inputs_expired'
                            additional_class_task = 'task_expired'
                        }
                    }
                    if (task['state'] === 'Выполнена') {
                        additional_class_inline = 'inline_inputs_done'
                        additional_class_task = 'task_done'
                    }

                    if (task['priority'] === 'Высокий') {
                        select_priority = ['selected="selected"', '', '']
                    } else {
                        if (task['priority'] === 'Средний') {
                            select_priority = ['', 'selected="selected"', '']
                        } else {
                            if (task['priority'] === 'Низкий') {
                                select_priority = ['', '', 'selected="selected"']
                            }
                        }
                    }

                    if (task['state'] === 'К выполнению') {
                        select_state = ['selected="selected"', '', '', '']
                    } else {
                        if (task['state'] === 'Выполняется') {
                            select_state = ['', 'selected="selected"', '', '']
                        } else {
                            if (task['state'] === 'Выполнена') {
                                select_state = ['', '', 'selected="selected"', '']
                            } else {

                                if (task['state'] === 'Отменена') {
                                    select_state = ['', '', '', 'selected="selected"']
                                }
                            }
                        }
                    }
                    if(current_group !== task[group_type]){

                        group_count += 1

                        current_group = task[group_type]
                        if(typeof current_group === "number"){
                            $tasks.append(`
                            <div class="single_group" id="group_id_${group_count}"> 
                                <span class="group_name">Ответственный пользователь: ${responsible_user['name'] + ' ' + responsible_user['surname']}</span>
                            </div>
                        `)
                        } else{
                            if(group_type === 'update_date'){
                                $tasks.append(`
                            <div class="single_group" id="group_id_${group_count}"> 
                                <span class="group_name">Дата обновления: ${get_date(current_group)}</span>
                            </div>
                        `)
                            } else{
                                $tasks.append(`
                            <div class="single_group" id="group_id_${group_count}"> 
                                <span class="group_name">Дата окончания: ${get_date(current_group)}</span>
                            </div>
                        `)
                            }

                        }

                        $task_group = $(`#group_id_${group_count}`)



                    }
                    console.log($task_group)
                    current_group = task[group_type]

                    $task_group.append(`<div id="task_${task['id']}" class="task task_start change_button ${additional_class_task}">
            <form id="form_task_${task['id']}" class="task_form">
            <div class="inline_parameters ${additional_class_inline}">
    
                <div class="inline_labels">
                    <label for="title_${task['id']}" class="inline_label input_disabled">Заголовок</label>
                    <label for="priority_${task['id']}" class="inline_label input_disabled">Приоритет</label>
                    <label for="end_date_${task['id']}" class="inline_label input_disabled">Дата окончания</label>
                    <label for="user_${task['id']}" class="inline_label input_disabled">Ответсвенный</label>
                    <label for="state_${task['id']}" class="inline_label input_disabled">Статус</label>
                </div>
    
                <div class="inline_inputs">
    
                    <input name="title" value="${task['title']}" type="text" class="input title inline_input input_disabled un_focused ${disabled_list['title']}" id="title_${task['id']}"  required>
    
                    <select name="priority" class="input inline_input input_disabled un_focused specific_select ${disabled_list['priority']}" id="priority_${task['id']}" required>
                        <option disabled>Выберите приоритет</option>
                        <option value="Высокий" ${select_priority[0]}>Высокий</option>
                        <option value="Средний" ${select_priority[1]}>Средний</option>
                        <option value="Низкий" ${select_priority[2]}>Низкий</option>
                    </select>
    
                    <input name="end_date" value="${get_date(task['end_date'])}" min="${get_date(get_current_date(2 * 7 * 24 * 60 * 60 * 1000))}" type="date" class="input inline_input input_disabled un_focused ${disabled_list['end_date']}" id="end_date_${task['id']}" required>
    
                    <input name="responsible_user_name" value="${responsible_user['name'] + ' ' + responsible_user['surname']}" type="text" class="input inline_input input_disabled un_focused  disabled_forever" id="responsible_user_${task['id']}" >
    
                    <select name="state" class="input inline_input input_disabled un_focused specific_select ${disabled_list['state']}" id="state_${task['id']}" required>
                        <option disabled>Выберите статус</option>
                        <option value="К выполнению" ${select_state[0]}>К выполнению</option>
                        <option value="Выполняется" ${select_state[1]}>Выполняется</option>
                        <option value="Выполнена" ${select_state[2]}>Выполнена</option>
                        <option value="Отменена" ${select_state[3]}>Отменена</option>
                    </select>
                </div>
    
            </div>
    
            <div class="left_parameters left_parameters_start">
    
                <div class="left_labels">
                    <label for="creation_date_${task['id']}" class="left_label input_disabled">Дата создания</label>
                    <label for="update_date_${task['id']}" class="left_label input_disabled">Дата обновения</label>
                    <label for="creator_${task['id']}" class="left_label input_disabled">Создатель</label>
                    <label for="user_email_${task['id']}" class="left_label input_disabled">Почта ответсвенного</label>
                    <label for="description_${task['id']}" class="left_label input_disabled">Описание</label>
                    
                    <label class="left_label input_disabled"></label>
                    <label class="left_label input_disabled"></label>
                    
                </div>
    
                <div class="left_inputs">
                    <input name="creation_date" value="${get_date(task['creation_date'])}" type="date" class="input left_input un_focused input_disabled  disabled_forever" id="creation_date_${task['id']}">
                    <input name="update_date" value="${get_date(task['update_date'])}" type="date" class="input left_input un_focused input_disabled  disabled_forever" id="update_date_${task['id']}">
                    <input name="creator_name" value="${creator['name'] + ' ' + creator['surname']}" type="text" class="input left_input un_focused input_disabled  disabled_forever" id="creator_${task['id']}">
                    <input name="responsible_user_email" value="${responsible_user['login']}" type="email" class="input left_input un_focused input_disabled ${disabled_list['responsible_user_email']}" id="user_email_${task['id']}" required>
                    <textarea name="description" class="input description left_input un_focused input_disabled ${disabled_list['description']}" id="description_${task['id']}" rows="2" cols="30" required>${task['description']}</textarea>
                
                    <button type="submit" class="save_button" value="old ${task['id']} creator ${creator['id']}">Сохранить</button>
    
                </div>
                
            </div>
            <div class="request_result left_parameters_start">
            
                <span class="result"></span>
                <span class="result"></span>
                <span class="result"></span>
            
                <span class="result error error_start">У вас нет подчинённого с такой почтой</span>
            
                <span class="result"></span>
                <span class="result"></span>
                <span class="result"></span>
            
            </div>
    
            </form>
        </div>`)
            }
            }



            $task_form = $('.task_form')
            $save_button = $('.save_button')

            $inline_input = $('.inline_input')
            $left_input = $('.left_input')
        }
    })

    $new_task_button.on('click', function(event){
        max_id_count += 1
        $tasks.prepend(`<div id="task_${max_id_count}" class="task task_start change_button">
        <form id="form_task_${max_id_count}" class="task_form">
        <div class="inline_parameters">

            <div class="inline_labels">
                <label for="title_${max_id_count}" class="inline_label">Заголовок</label>
                <label for="priority_${max_id_count}" class="inline_label">Приоритет</label>
                <label for="end_date_${max_id_count}" class="inline_label">Дата окончания</label>
                <label for="user_${max_id_count}" class="inline_label">Ответсвенный</label>
                <label for="status_${max_id_count}" class="inline_label">Статус</label>
            </div>

            <div class="inline_inputs">

                <input name="title" type="text" class="input title inline_input input_disabled un_focused" id="title_${max_id_count}"  required>

                <select name="priority" class="input inline_input input_disabled un_focused specific_select" id="priority_${max_id_count}" required>
                    <option disabled>Выберите приоритет</option>
                    <option value="Высокий">Высокий</option>
                    <option value="Средний">Средний</option>
                    <option value="Низкий">Низкий</option>
                </select>

                <input name="end_date"  min="${get_date(get_current_date(2*7*24*60*60*1000))}" type="date" class="input inline_input input_disabled un_focused" id="end_date_${max_id_count}" required>

                <input name="responsible_user_name" type="text" class="input inline_input input_disabled un_focused  disabled_forever" id="responsible_user_${max_id_count}" >

                <select name="state" class="input inline_input input_disabled un_focused specific_select" id="state_${max_id_count}" required>
                    <option disabled>Выберите статус</option>
                    <option value="К выполнению">К выполнению</option>
                    <option value="Выполняется">Выполняется</option>
                    <option value="Выполнена">Выполнена</option>
                    <option value="Отменена">Отменена</option>
                </select>
            </div>

        </div>

        <div class="left_parameters left_parameters_start">

            <div class="left_labels">
                <label for="creation_date_${max_id_count}" class="left_label">Дата создания</label>
                <label for="update_date_${max_id_count}" class="left_label">Дата обновения</label>
                <label for="creator_${max_id_count}" class="left_label">Создатель</label>
                <label for="user_email_${max_id_count}" class="left_label">Почта ответсвенного</label>
                <label for="description_${max_id_count}" class="left_label">Описание</label>
            
                <label class="left_label input_disabled"></label>
                <label class="left_label input_disabled"></label>
                    
            </div>

            <div class="left_inputs">
                <input name="creation_date" type="date" class="input left_input un_focused input_disabled  disabled_forever" id="creation_date_${max_id_count}">
                <input name="update_date" type="date" class="input left_input un_focused input_disabled  disabled_forever" id="update_date_${max_id_count}">
                <input name="creator_name" type="text" class="input left_input un_focused input_disabled  disabled_forever" id="creator_${max_id_count}">
                <input name="responsible_user_email" type="email" class="input left_input un_focused input_disabled" id="user_email_${max_id_count}" required>
                <textarea name="description" class="input description left_input un_focused input_disabled" id="description_${max_id_count}" rows="2" cols="30" required></textarea>
            
                <button type="submit" class="save_button" value="new ${max_id_count} creator ${current_user['id']}">Сохранить</button>

            </div>
            
        </div>
        <div class="request_result left_parameters_start">
        
            <span class="result"></span>
            <span class="result"></span>
            <span class="result"></span>
        
            <span class="error error_start">У вас нет подчинённого с такой почтой</span>
        
            <span class="result"></span>
            <span class="result"></span>
            <span class="result"></span>
            
        </div>

        </form>
    </div>`)


        $task_form = $('.task_form')
        $save_button = $('.save_button')

        $inline_input = $('.inline_input')
        $left_input = $('.left_input')
    })

    $(document).on('focus focusout', '.input', function(event){
        $(this).toggleClass(function(index, cls, swt){
            return 'un_focused focused'
        })
    })

    $(document).on('click', '.group_button', function (event){
        group_type = $(this).val()

        $.ajax({
            url: '/task/change_group_type',
            method: 'GET',
            dataType: 'json',
            data: 'group_type='+group_type,
            contentType: 'application/json',
            success: function (data){
                window.location.reload()
            }
        })
    })

    $(document).on('click', '.change_button',function (event) {
        if(event.target.tagName === 'DIV') {
            let task = $(this)
            let left_parameters_div = $(this).children('.task_form').children('.left_parameters')
            let request_result = $(this).children('.task_form').children('.request_result')
            task.toggleClass(function(index, cls, swt){
                if(! (cls.search('task_start') === -1)){
                    $(this).removeClass('task_start')
                    return 'task_not_folded'
                } else{
                    return 'task_not_folded task_folded'
                }
            })

            left_parameters_div.toggleClass(function(index, cls, swt){
                if(! (cls.search('left_parameters_start') === -1)){
                    $(this).removeClass('left_parameters_start')
                    return 'left_parameters_un_folded'
                } else{
                    return 'left_parameters_un_folded left_parameters_folded'
                }
            })

            request_result.toggleClass(function(index, cls, swt){
                if(! (cls.search('left_parameters_start') === -1)){
                    $(this).removeClass('left_parameters_start')
                    return 'request_result_un_folded'
                } else{
                    return 'request_result_un_folded request_result_folded'
                }
            })

            $inline_input.toggleClass(function(index, cls, swt){
                return 'input_enabled input_disabled'
            })

            $left_input.toggleClass(function(index, cls, swt){
                return 'input_enabled input_disabled'
            })

        }
    })

    $(document).on('submit', '.task_form', function(e){
        console.log('save')
        e.preventDefault()
        let $save_button = $(this).children('.left_parameters').children('.left_inputs').children('.save_button')
        let $error = $(this).children('.request_result').children('.error')

        if(!$error.hasClass('error_start')){
            $error.removeClass('error_active')
            $error.addClass('error_inactive')
        }

        let details = $(this).serializeArray()

        let task_id = parseInt(($save_button.val().slice(4,5)))
        let old = $save_button.val().slice(0, 3) === 'old'
        if(!old){
            $save_button.val('old' + $save_button.val().slice(3))
        }
        console.log($save_button.val())
        console.log(details)
        console.log(JSON.stringify(details))
        let creator_id = $save_button.val().slice(-1)

        let result_data = {'details':details, 'old':old, 'creator_id':creator_id, 'task_id':task_id}

        details.push({'name':'old', 'value':old})
        details.push({'name':'creator_id', 'value':creator_id})
        details.push({'name':'task_id', 'value':task_id})
        console.log(details)



        $.ajax({
            url: '/task/submit',
            method: 'POST',
            data: JSON.stringify(details),
            dataType: 'json',
            contentType: 'application/json',
            success: function (data) {
                console.log(data)
                if(data['result'] === 'not_existing_user_email'){
                    $error.text('Пользователя с такой почтой не существует')
                    $error.removeClass('error_start')
                    $error.removeClass('error_inactive')
                    $error.addClass('error_active')
                }
                if(data['result'] === 'not_existing_user_director_connection'){
                    $error.text('У вас нет подчинённого с такой почтой')
                    $error.removeClass('error_start')
                    $error.removeClass('error_inactive')
                    $error.addClass('error_active')
                }
                if(data['result'] === 'successful'){
                    alert('Данные успешно сохранены')
                    window.location.assign('/')
                }
            }
        })

    })




})