const http = require('http')
const fs = require('fs')
const db_config = require('./database_config')
const bcrypt = require('bcrypt')
const saltRounds = 10
// const express = require('express')
const url = require('url')


const hostname = '127.0.0.1'
const port = 1002

function get_date(date){
    return [date.getFullYear(),
        ((date.getMonth() + 1) > 9 ? '' : '0') + (date.getMonth() + 1),
        (date.getDate() > 9 ? '' : '0') + date.getDate()
    ].join('-')
}

const server = http.createServer()
let session ={'user_id':0, 'user':null, 'group_type': null}
let group_type = 'update_date'
server.on('request', async function(req, res) {
    let current_url = url.parse(req.url, true)
    console.log(req.method, req.url)
    // console.log(session)
    let url_data = current_url.query
    let user = []
    let body = []
    switch (current_url.pathname) {

        case '/':
            if(session.user_id === 0){
                res.writeHead(302, {Location: '/authorization'})
                res.end()
            } else {
                fs.readFile('html/index.html', (err, data) => {
                    res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': data.length})
                    res.write(data)
                    res.end()
                })
            }
            break


        case '/css/index.css':
            fs.readFile('css/index.css', (err, data) => {
                res.write(data)
                res.end()
            })
            break


        case '/js/index.js':
            fs.readFile('js/index.js', (err, data) => {
                res.write(data)
                res.end()
            })
            break


        case '/tasks/get':
            let tasks
            console.log(group_type)
            await db_config.select('tasks', {},  (result) => {tasks = result}, {group_type})
            let users
            await db_config.select('users', {}, function(result) {
                users = result
            })
            res.write(JSON.stringify({'tasks': tasks, 'users':users, 'user':session['user'], 'group_type':group_type}))
            res.end()
            break

        case '/task/change_group_type':
            url_data = current_url.query
            group_type = url_data['group_type']
            console.log(group_type)
            res.write(JSON.stringify({'result': 'successful'}))
            res.end()
            break

        case '/task/submit':
            body = []
            await req.on('data', await function (chunk) {
                body.push(chunk)
            })
            req.on('end', async function () {
                body = Buffer.concat(body).toString()
                let data = JSON.parse(body)

                let parsed_data = {}

                for(let single_data of data){
                    parsed_data[single_data['name']] = single_data['value']
                }

                user = []
                await db_config.select('users', {'login': parsed_data['responsible_user_email']}, function(result) {
                    user = result
                })
                if(user.length === 0){
                    res.write(JSON.stringify({'result': 'not_existing_user_email'}))
                    res.end()
                } else{
                    let responsible_user_id = user[0]['id']
                    let task_id = parsed_data['task_id']
                    let connection =[]
                    await db_config.select('user_director', {'user_id':responsible_user_id, 'director_id':parseInt(parsed_data['creator_id'])}, function(result){
                        connection = result
                    })
                    if(connection.length === 0){
                        res.write(JSON.stringify({'result': 'not_existing_user_director_connection'}))
                        res.end()
                    } else {
                        let current_date = get_date(new Date(Date.now()))
                        if(parsed_data['old']) {
                            await db_config.update('tasks', {
                                'title': parsed_data['title'], 'priority': parsed_data['priority'],
                                'end_date': parsed_data['end_date'], 'update_date': current_date,
                                'state': parsed_data['state'], 'description': parsed_data['description'],
                                'responsible_user_id': responsible_user_id
                            }, {'id':task_id})
                        } else{
                            await db_config.insert('tasks', {'title': parsed_data['title'], 'priority': parsed_data['priority'],
                                'end_date': parsed_data['end_date'], 'update_date': current_date, 'creation_date': current_date,
                                'state': parsed_data['state'], 'description': parsed_data['description'], 'creator_id': session['user']['id'],
                                'responsible_user_id': responsible_user_id})
                        }
                        res.write(JSON.stringify({'result': 'successful'}))
                        res.end()
                    }
                }


            });

            break


        case '/authorization':
            if(session.user_id !== 0) {
                res.writeHead(302, {Location: '/'})
                res.end()
            } else {
                fs.readFile('html/authorization.html', (err, data) => {
                    res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': data.length})
                    res.write(data)
                    res.end()
                })
            }
            break


        case '/css/authorization.css':
            fs.readFile('css/authorization.css', (err, data) => {
                res.write(data)
                res.end()
            })
            break


        case '/js/authorization.js':
            fs.readFile('js/authorization.js', (err, data) => {
                res.write(data)
                res.end()
            })
            break


        case '/authorization/submit':
            url_data = current_url.query
            user = []

            await db_config.select('users', {'login':url_data['login']}, function(result) {
                user = result
            })

            if(user.length === 0){
                res.write(JSON.stringify({'result': 'wrong_email'}))
                res.end()
            } else{
                let password_compare_result = await bcrypt.compare(url_data['password'], user[0]['password'])
                if(!password_compare_result){
                    res.write(JSON.stringify({'result': 'wrong_password'}))
                    res.end()
                } else{
                    session.user_id = user[0].id
                    session.user = user[0]
                    res.writeHead(200, {'Set-Cookie': `user_login=1; Path=/`})
                    res.write(JSON.stringify({'result': 'successful'}))
                    console.log(res)
                    res.end()
                }
            }
            break


        case '/registration':
            if(session.user_id !== 0) {
                res.writeHead(302, {Location: '/'})
                res.end()
            } else {
                fs.readFile('html/registration.html', (err, data) => {
                    res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length})
                    res.write(data)
                    res.end()
                })
            }
            break


        case '/css/registration.css':
            fs.readFile('css/registration.css', (err, data) => {
                res.write(data)
                res.end()
            })
            break


        case '/js/registration.js':
            fs.readFile('js/registration.js', (err, data) => {
                res.write(data)
                res.end()
            })
            break


        case '/registration/submit':
            body = []
            await req.on('data', await function (chunk) {
                body.push(chunk)
            })
            req.on('end', async function () {
                body = Buffer.concat(body).toString()
                let data = JSON.parse(body)

                let parsed_data = {}

                for (let single_data of data) {
                    parsed_data[single_data['name']] = single_data['value']
                }
            user = []
            await db_config.select('users', {'login':parsed_data['login']}, function(result) {
                user = result
            })
            if(user.length > 0){
                res.write(JSON.stringify({'result': 'existing_user'}))
                res.end()
            } else{
                let director = []



                await db_config.select('users', {'login':parsed_data['director_login']}, function(result) {
                    director = result
                })
                if(director.length === 0&&(!parsed_data['director_login'] === parsed_data['login'])){
                    res.write(JSON.stringify({'result': 'not_existing_director'}))
                    res.end()
                } else{
                    let password = await bcrypt.hash(parsed_data['password'], saltRounds)
                    await db_config.insert('users', {'name': parsed_data['name'], 'surname': parsed_data['surname'], 'patronymic': parsed_data['patronymic'],
                        'login': parsed_data['login'], 'password': password})
                    await db_config.select('users', {'login':parsed_data['login']},  function(result) {
                        user = result
                    })
                    if(parsed_data['director_login'] === parsed_data['login']){
                        director = user
                    }
                    if(director.length>0){
                        if(!(director[0].id === user[0].id)){
                            await db_config.insert('user_director', {'director_id': director[0].id, 'user_id': user[0].id})
                        }
                        await db_config.insert('user_director', {'director_id': user[0].id, 'user_id': user[0].id})
                    }
                    session.user_id = user[0].id
                    session.user = user[0]
                    res.write(JSON.stringify({'result': 'successful'}))
                    res.end()
                }
            }
            })

            break


        case '/js/jquery-3.5.1.min.js':
            fs.readFile('js/jquery-3.5.1.min.js', (err, data) => {
                res.write(data)
                res.end()
            })
            break


        default:
            console.log('404   ' + current_url)
            res.writeHead(404)
            res.end()
            break
    }
})

server.listen(port, hostname, () => console.log(`Server running at http://${hostname}:${port}/`))