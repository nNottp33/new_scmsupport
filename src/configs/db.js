const config = require("./config");
const knex = require('knex')

// create a pool connection
const conKnex = knex.default({
    client: 'mysql2',
    connection: {
        host: config.db.host,
        port: 3306,
        user: config.db.user,
        password: config.db.password,
        database: config.db.dbname
    },
    pool: { min: 0, max: 7 }
});

// const ExecuteQuery = async (sql) => {
//     return await new Promise((resolve, reject) => {
//         connection.query(sql, (err, result, fields) => {
//             if (err) throw err;
//             return err ? reject(err) : resolve(result);
//         });
//     });
// }

module.exports = conKnex;