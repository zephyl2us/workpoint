'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

/** @type {import('@adonisjs/ignitor/src/Helpers')} */
const Helpers = use('Helpers')

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Connection
  |--------------------------------------------------------------------------
  |
  | Connection defines the default connection settings to be used while
  | interacting with SQL databases.
  |
  */
  connection: Env.get('DB_CONNECTION', 'sqlite'),

  /*
  |--------------------------------------------------------------------------
  | Sqlite
  |--------------------------------------------------------------------------
  |
  | Sqlite is a flat file database and can be good choice under development
  | environment.
  |
  | npm i --save sqlite3
  |
  */
  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: Helpers.databasePath(`${Env.get('DB_DATABASE', 'development')}.sqlite`)
    },
    useNullAsDefault: true
  },

  /*
  |--------------------------------------------------------------------------
  | MySQL
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for MySQL database.
  |
  | npm i --save mysql
  |
  */
  mysql: {
    client: 'mysql2',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    },
		pool: { min: 0, max: 50 },
		debug: false
  },

	/*
  |--------------------------------------------------------------------------
  | MySQL Reader
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for MySQL database.
  |
  | npm i --save mysql
  |
  */
	mysql_read: {
		client: 'mysql2',
		connection: {
			host: Env.get('DB_READ_HOST', 'localhost'),
			port: Env.get('DB_READ_PORT', ''),
			user: Env.get('DB_READ_USER', 'root'),
			password: Env.get('DB_READ_PASSWORD', ''),
			database: Env.get('DB_READ_DATABASE', 'adonis')
		},
		pool: { min: 0, max: 50 },
		debug: false
	},

  /*
  |--------------------------------------------------------------------------
  | MySQL
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for MySQL database.
  |
  | npm i --save mysql
  |
  */
  mysql_one: {
    client: 'mysql2',
    connection: {
      host: Env.get('DB_ONE_HOST', 'localhost'),
      port: Env.get('DB_ONE_PORT', ''),
      user: Env.get('DB_ONE_USER', 'root'),
      password: Env.get('DB_ONE_PASSWORD', ''),
      database: Env.get('DB_ONE_DATABASE', 'lottoone')
    },
		pool: { min: 0, max: 50 },
		debug: false
  },

  /*
  |--------------------------------------------------------------------------
  | PostgreSQL
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for PostgreSQL database.
  |
  | npm i --save pg
  |
  */
  pg: {
    client: 'pg',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    }
  }
}
