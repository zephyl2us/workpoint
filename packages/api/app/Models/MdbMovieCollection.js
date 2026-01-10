'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MdbMovieCollection extends Model {
  collection () {
    return this.hasOne('App/Models/MdbCollection', 'mdb_collection_id', 'id')
	}
}

module.exports = MdbMovieCollection
