const http = require('http')
const fs = require('fs')
const db_config = require('./database_config')
// const express = require('express')
const url = require('url')


const hostname = '127.0.0.1'
const port = 1002

const server = http.createServer()
let session ={'user_id':0, 'user':NaN}
server.on('request', async function(req, res) {
    let current_url = url.parse(req.url, true)
    console.log(req.method, req.url)
    // console.log(session)
    let url_data = current_url.query
    let user = []
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
            await db_config.select('tasks', {}, function(result) {
                tasks = result
            })
            let users
            await db_config.select('users', {}, function(result) {
                users = result
            })
            res.write(JSON.stringify({'tasks': tasks, 'users':users, 'user':session['user']}))
            res.end()
            break


        case '/task/submit':
            url_data = current_url.query
            user = []
            console.log(url_data)
            console.log(parseInt(url_data['creator_id'].slice(1, -1)))
            await db_config.select('users', {'login': url_data['responsible_user_email']}, function(result) {
                user = result
            })
            if(user.length === 0){
                res.write(JSON.stringify({'result': 'not_existing_user_email'}))
                res.end()
            } else{
                let connection =[]
                await db_config.select('user_director', {'user_id':user[0]['id'], 'director_id':parseInt(url_data['creator_id'].slice(1, -1))}, function(result){
                    connection = result
                })
                if(connection.length === 0){
                    res.write(JSON.stringify({'result': 'not_existing_user_director_connection'}))
                    res.end()
                } else {
                    await db_config.update('tasks', {
                        'title': url_data['title'], 'priority': url_data['priority'],
                        'end_date': url_data['end_date'], 'update_date': url_data['new_update_date'].slice(1, -1),
                        'state': url_data['state'], 'description': url_data['description'],
                        'responsible_user_id': user[0]['id']
                    }, {})
                    res.write(JSON.stringify({'result': 'successful'}))
                    res.end()
                }
            }
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
            await db_config['select']('users', {'login':url_data['login']}, await function(result) {
                user = result
            })
            if(user.length === 0){
                res.write(JSON.stringify({'result': 'wrong_email'}))
                res.end()
            } else{
                user = []
                await db_config['select']('users', {'login':url_data['login'], 'password': url_data['password']}, function(result){
                    user = result
                })
                if(user.length === 0){
                    res.write(JSON.stringify({'result': 'wrong_password'}))
                    res.end()
                } else{
                    session.user_id = user[0].id
                    session.user = user[0]
                    res.write(JSON.stringify({'result': 'successful'}))
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
            url_data = current_url.query
            user = []
            await db_config['select']('users', {'login':url_data['login']}, await function(result) {
                user = result
            })
            if(user.length > 0){
                res.write(JSON.stringify({'result': 'existing_user'}))
                res.end()
            } else{
                let director = []
                await db_config['select']('users', {'login':url_data['director_login']}, await function(result) {
                    director = result
                })
                if(director.length === 0){
                    res.write(JSON.stringify({'result': 'not_existing_director'}))
                    res.end()
                } else{
                    await db_config.insert('users', {'name': url_data['name'], 'surname': url_data['surname'], 'patronymic': url_data['patronymic'],
                        'login': url_data['login'], 'password': url_data['password']})
                    await db_config['select']('users', {'login':url_data['login']}, await function(result) {
                        user = result
                    })
                    if(director.length>0){
                        await db_config.insert('user_director', {'director_id': director[0].id, 'user_id': user[0].id})
                    }
                    session.user_id = user[0].id
                    session.user = user[0]
                    res.write(JSON.stringify({'result': 'successful'}))
                    res.end()
                }
            }
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