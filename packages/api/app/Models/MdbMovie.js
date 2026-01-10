'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Filter = use('App/Models/Filters/MdbMovieFilter')
const Sorter = use('App/Models/Sorters/MdbMovieSorter')

class MdbMovie extends Model {
  static boot() {
    super.boot()
    this.addTrait('@provider:Filterable', Filter)
    this.addTrait('@provider:Sortable', Sorter)
  }

  credits () {
    return this.hasMany('App/Models/MdbMovieCredit')
	}

  collection () {
    return this.hasOne('App/Models/MdbMovieCollection')
	}

  companies () {
    return this.hasMany('App/Models/MdbMovieCompany')
	}

  genres () {
    return this.hasMany('App/Models/MdbMovieGenre')
	}

  source () {
    return this.hasOne('App/Models/MdbSource')
	}

  videos () {
    return this.hasMany('App/Models/MdbMovieVideo')
	}

  medias () {
    return this.hasMany('App/Models/MdbMovieMedia')
	}

}

module.exports = MdbMovie
