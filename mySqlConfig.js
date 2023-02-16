// configuration mySql server
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    database: 'whatsapp',
    user: 'root',
    password: '123',
});

connection.connect(function (err) {
    if (err) throw err;
    console.log('Connected!');
}
);