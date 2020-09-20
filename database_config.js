const mysql = require('mysql')

const con = mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "qwerty1234",
    database: "node_database"
})

function query(sql){
    return new Promise(function(resolve, reject){
        con.query(sql, function(err, result){
            if (err) throw err
            console.log(result)
            resolve(result)
        })

    })
}

async function create_table(name, dict){
    let columns = ''
    for (const [key, value] of Object.entries(dict)) {
        columns += key + ' ' + value + ', '
    }
    columns = columns.slice(0, -2)
    let sql = `CREATE TABLE ${name} (${columns});`
    console.log(sql)
    await query(sql)
}

async function insert(table, dict){
    let values = ''
    let keys = ''
    for (const [key, value] of Object.entries(dict)) {
        keys += key + ', '
        if(typeof(value) === 'string'){
            values += "'" + value + "'" + ', '
        }else {
            values += value + ', '
        }
    }
    keys = keys.slice(0, -2)
    values = values.slice(0, -2)
    let sql = `INSERT INTO ${table} (${keys}) VALUES (${values});`
    console.log(sql)
    await query(sql)
}

async function select(table, dict, callback,  lim){
    let conditions = ''
    for (const [key, value] of Object.entries(dict)) {
        if(typeof(value) === 'string'){
            conditions += key + " = '" + value + "' AND "
        }else {
            conditions += key + " = " + value + " AND "
        }
    }
    conditions = conditions.slice(0, -5)
    let sql
    if(lim === undefined) {
        sql = `SELECT * FROM ${table} WHERE ${conditions};`
    } else{
        sql = `SELECT * FROM ${table} WHERE ${conditions} LIMIT ${lim};`
    }
    console.log(sql)

    let res = await query(sql)
    callback(res)
}

async function update(table, column_dict, condition_dict){
    let columns = ''
    for (const [key, value] of Object.entries(column_dict)) {
        if(typeof(value) === 'string'){
            columns += key + " = '" + value + "', "
        }else {
            columns += key + " = " + value + ", "
        }
    }
    columns = columns.slice(0, -2)

    let conditions = ''
    for (const [key, value] of Object.entries(condition_dict)) {
        if(typeof(value) === 'string'){
            conditions += key + " = '" + value + "' AND "
        }else {
            conditions += key + " = " + value + " AND "
        }
    }
    conditions = conditions.slice(0, -5)

    let sql = `UPDATE ${table} SET ${columns} WHERE ${conditions};`
    console.log(sql)
    await query(sql)
}


async function del(table, dict){
    let conditions = ''
    for (const [key, value] of Object.entries(dict)) {
        if(typeof(value) === 'string'){
            conditions += key + " = '" + value + "' AND "
        }else {
            conditions += key + " = " + value + " AND "
        }
    }
    conditions = conditions.slice(0, -5)
    let sql = `DELETE FROM ${table} WHERE ${conditions};`
    console.log(sql)
    await query(sql)
}

function init_db(){
    create_table('users', {'id': 'int AUTO_INCREMENT PRIMARY KEY', 'name': 'varchar(30)', 'surname': 'varchar(50)',
                                    'patronymic': 'varchar(30)', 'login': 'varchar(100) NOT NULL UNIQUE',
                                    'password': 'varchar(100) NOT NULL'})
    create_table('user_director', {'id': 'int AUTO_INCREMENT PRIMARY KEY',
                                                    'director_id': 'int', 'FOREIGN KEY (director_id)': 'REFERENCES users(id)',
                                                    'user_id': 'int', 'FOREIGN KEY (user_id)': 'REFERENCES users(id)'})
    create_table('tasks', {'id': 'int AUTO_INCREMENT PRIMARY KEY', 'title': 'varchar(150)', 'description': 'text',
                                    'end_date': 'date', 'creation_date': 'date', 'update_date': 'date', 'priority': 'varchar(7)',
                                    'state': 'varchar(12)', 'creator_id': 'int' ,  'FOREIGN KEY (creator_id)': 'REFERENCES users(id)',
                                    'user_id': 'int', 'FOREIGN KEY (user_id)': 'REFERENCES users(id)'})
    insert('users', {'name': 'we', 'surname': 'YEET', 'patronymic': 'ku', 'login': 'test0@mail.ru', 'password': 'qwerty1234'})
    insert('users', {'name': 'we', 'surname': 'YEET', 'patronymic': 'ku', 'login': 'test1@mail.ru', 'password': 'qwerty1234'})
    insert('user_director', {'director_id': 1, 'user_id': 2})
}

function drop_db(){
    let tables = ['tasks', 'user_director', 'users']
    for(const table of tables){
        let sql = `DROP TABLE ${table};`
        console.log(sql)
        con.query(sql, (err, result) => {
            if(err) throw err
            console.log(result)
        })
    }
}


// drop_db()
// init_db()
module.exports = {
    select: select,
    update: update,
    insert: insert
}