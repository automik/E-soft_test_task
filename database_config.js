const mysql = require('mysql')

const con = mysql.createConnection({
    host: "sql12.freemysqlhosting.net",
    user: "sql12367791",
    password: "wYcY4xbqkQ",
    database: "sql12367791"
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

async function select(table, condition_dict, callback, order,  lim){
    let conditions = ''
    for (const [key, value] of Object.entries(condition_dict)) {
        if(typeof(value) === 'string'){
            conditions += key + " = '" + value + "' AND "
        }else {
            conditions += key + " = " + value + " AND "
        }
    }
    if(order === undefined||order['group_type'] === undefined){
        order = ''
    } else{
        order = 'ORDER BY ' + order['group_type']
    }
    if(lim === undefined){
        lim = ''
    } else{
        lim = 'LIMIT ' + lim
    }

    let sql
    if(conditions.length > 0){
        conditions = conditions.slice(0, -5)
            sql = `SELECT * FROM ${table} WHERE ${conditions} ${order} ${lim};`
    } else{
        sql = `SELECT * FROM ${table} ${order} ${lim};`
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
    let sql
    if(conditions.length>0) {
        conditions = conditions.slice(0, -5)
        sql = `UPDATE ${table} SET ${columns} WHERE ${conditions};`
    } else{
        sql = `UPDATE ${table} SET ${columns};`
    }
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
                                    'end_date': 'date', 'creation_date': 'date', 'update_date': 'date', 'priority': 'varchar(10)',
                                    'state': 'varchar(20)', 'creator_id': 'int' ,  'FOREIGN KEY (creator_id)': 'REFERENCES users(id)',
                                    'responsible_user_id': 'int', 'FOREIGN KEY (responsible_user_id)': 'REFERENCES users(id)'})
    insert('users', {'name': 'we', 'surname': 'YEET', 'patronymic': 'ku', 'login': 'test0@mail.ru', 'password': '$2b$10$q51t/u77suSRwS7IFVykMuxeqBgaVhiP0uTekl2I1Vz73nYq778zu'})
    insert('users', {'name': 'we', 'surname': 'YEET', 'patronymic': 'ku', 'login': 'test1@mail.ru', 'password': '$2b$10$q51t/u77suSRwS7IFVykMuxeqBgaVhiP0uTekl2I1Vz73nYq778zu'})
    insert('tasks', {'title':'TEST_TASK', 'description':'just try to test this shit', 'end_date':'2020-09-24',
                               'creation_date':'2020-09-17', 'update_date':'2020-09-30', 'priority':'high',
                               'state':'in progress', 'creator_id':1, 'responsible_user_id':2})
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