const mysql = require('mysql');

const con = mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "qwerty1234",
    database: "node_database"
});

function create_table(name, dict){
    let columns = ''
    for (const [key, value] of Object.entries(dict)) {
        columns += key + ' ' + value + ', ';
    }
    columns = columns.slice(0, -2)
    let sql = `CREATE TABLE ${name} (${columns});`
    console.log(sql)
    con.query(sql, (err, result) => {
        if(err) throw err
        console.log(result)
    })
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


drop_db()
init_db()
// module.exports = create_table()