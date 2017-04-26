// Connector to T2 DB for bot

var pg = require('pg')

process.on('unhandledRejection', function(e) {
  console.log(e.message, e.stack)
})

var pool = new pg.Pool('postgres://tgrm:lkilkzavr@localhost:5432/tgrm_db')

var query = pool.query('SELECT password_hash FROM system_user')

query.on('row', function(e,r) {
	console.log(row[0])
})