'use strict'

const { Command } = require('@adonisjs/ace')
const _ = use('lodash')
const moment = use('moment')
const Bull = use('Bull')
const MovieTmdbUpdateJob = use('App/Jobs/MovieTmdbUpdate')
const MovieRepository = make('App/Repositories/Movie/MovieRepository')

class MovieUpdate extends Command {
  static get signature () {
    return 'movie:update'
  }

  static get description () {
    return 'Tell something helpful about this command'
  }

  async handle (args, options) {
    this.info('Dummy implementation for movie:update command')
		const filter = {
      // ref_id: 445651
    }

    let movies = await MovieRepository
			.browse({ filter: filter })
      .select('id', 'ref_id')
			.fetch()

		movies = movies.toJSON()

    // console.log(`Total movie: `, _.size(movies))

		for(let i = 0; i < _.size(movies); i++) {
      const movie = movies[i]
      const refId = _.get(movie, 'ref_id')
      Bull.add(MovieTmdbUpdateJob.key, {
        id: refId
      })
      // console.log(refId)
    }

  }
}

module.exports = MovieUpdate
