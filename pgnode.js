// Connector to T2 DB for bot

var pg = require('pg')
var bcrypt = require('bcrypt')

process.on('unhandledRejection', function(e) {
  console.log(e.message, e.stack)
})

var pool = new pg.Pool(
	{
  user: 'tgrm',
  password: 'lkilkzavr',
  host: 'localhost',
  database: 'tgrm_db',
  max: 10, // max number of clients in pool
  idleTimeoutMillis: 2000, // close & remove clients which have been idle > 1 second
})

function checkPassword(login,password) {
	var password_query = pool.query('SELECT password_hash FROM system_user WHERE login=$1',[login]);
	var result = new Promise((resolve,reject)=> {
	password_query.then(function(val){
		resolve(bcrypt.compare(password,val.rows[0].password_hash))
	}).catch(function(e){resolve(false);});
	})
	return result;
}

module.exports.checkPassword=checkPassword;
