const mysql = require('mysql');
const fs = require('fs');

process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
});

const path = process.argv[process.argv.indexOf('--path')+1];
const database = process.argv[process.argv.indexOf('--database')+1];

const connection = mysql.createConnection({
    user: 'root',
    password: 'root',
    host: 'localhost',
    port: 3307,
    database: database
});

connection.connect(function(err) {
    if(err) {
        console.log(err);
        return;
    }

    console.log('connected as id ' + connection.threadId);
})


const singleQuery = (query) => new Promise((resolve, reject) => 
connection.query(query, (err, res) =>
err != null ? reject(err) : resolve(res))); 

const multiQuery = (query, values) => new Promise((resolve, reject) => 
connection.query(query, values, (err, res) =>
err != null ? reject(err) : resolve(res))); 


async function main(){
    let tables = await singleQuery(`show tables;`);

    for(let table of tables) {
        let res = await singleQuery(`select * from ${tables[0].Tables_in_mydb};`)
        console.log(res);

        let insertCopy = '';
        for(let elem of res) {
            let keys = [];
            let values = [];
            
            for(let key of Object.keys(elem)) {
                keys.push(key);
                values.push(elem[key]);
            }
            
            insertCopy += `INSERT INTO ${table.Tables_in_mydb} (${keys.join(',')}) VALUES (${values.join(',')});\n`;
        }

        fs.writeFileSync(`${path}/${table.Tables_in_mydb}.sql`, insertCopy);
    }

}

if(path){
    main();
}