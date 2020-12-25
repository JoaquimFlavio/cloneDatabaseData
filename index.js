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
});

const singleQuery = (query) => new Promise((resolve, reject) => 
connection.query(query, (err, res) =>
err != null ? reject(err) : resolve(res))); 

async function main(){
    let tables = await singleQuery(`show tables;`);

    const search = 'Tables_in_' + 'xsl5uthvvcxby29g';

    for(let table of tables.slice(0, tables.length)) {
        let res = await singleQuery(`select * from ${table[search]};`)
        console.log(res);

        let insertCopy = '';
        for(let elem of res) {
            let keys = [];
            let values = [];
            
            for(let key of Object.keys(elem)) {
                keys.push(key);
                values.push(elem[key]);
            }
            
            let values_str = ``;
            for(let value of values) {
                if(typeof value === "string"){
                    values_str += `'${value}',`
                } else {
                    values_str += `${value},`
                }
            }
            values_str = values_str.slice(0, values_str.length-1);

            insertCopy += `INSERT INTO ${table[search]} (${keys.join(',')}) VALUES (${values_str});\n`;
        }

        fs.writeFileSync(`${path}/${table[search]}.sql`, insertCopy);
    }

}

async function main2() {
    try {
        await main();
    } catch (error) {
        console.error(error)
    } finally {
        console.log("Close connection!")
        connection.end();
    }
}

if(path){
    main2()
}
