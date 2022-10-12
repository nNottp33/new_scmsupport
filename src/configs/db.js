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

module.exports = conKnex;