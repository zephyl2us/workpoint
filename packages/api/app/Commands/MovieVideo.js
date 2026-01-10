'use strict'

const { Command } = require('@adonisjs/ace')
const _ = use('lodash')
const moment = use('moment')
const Bull = use('Bull')
const MovieTmdbVideoJob = use('App/Jobs/MovieTmdbVideo')
const MovieRepository = make('App/Repositories/Movie/MovieRepository')

class MovieVideo extends Command {
  static get signature () {
    return 'movie:video'
  }

  static get description () {
    return 'Tell something helpful about this command'
  }

  async handle (args, options) {
    // this.info('Dummy implementation for movie:update command')
		const filter = {}

    let movies = await MovieRepository
			.browse({ filter: filter })
      .select('id', 'ref_id')
      // .where('ref_id', 385687)
			.fetch()

		movies = movies.toJSON()

    // console.log(`Total movie: `, _.size(movies))

		for(let i = 0; i < _.size(movies); i++) {
      const movie = movies[i]
      const refId = _.get(movie, 'ref_id')
      Bull.add(MovieTmdbVideoJob.key, {
        id: refId
      })
      // console.log(refId)
    }

  }
}

module.exports = MovieVideo
