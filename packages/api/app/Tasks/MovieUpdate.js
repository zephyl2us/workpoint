'use strict'

const _ = use('lodash')
const moment = use('moment')
const Helper = use('App/Helper')
const Task = use('Task')
const Bull = use('Bull')
const MovieTmdbUpdateJob = use('App/Jobs/MovieTmdbUpdate')
const MovieRepository = make('App/Repositories/Movie/MovieRepository')
const LogRepository = make('App/Repositories/LogRepository')

class MovieUpdate extends Task {
  static get schedule () {
    return '0 30 5 * * *'
  }

  async handle () {
    // this.info('Task MovieUpdate handle')
    if(Helper.isDevMode()) console.log('Scheduler : Movie update every day (0)')

    try {
      const filter = {
        is_enable: false
      }
  
      let movies = await MovieRepository
        .browse({ filter: filter })
        .select('id', 'ref_id')
        .fetch()
  
      movies = movies.toJSON()
  
      console.log(`Total movie: `, _.size(movies))
  
      for(let i = 0; i < _.size(movies); i++) {
        const movie = movies[i]
        const refId = _.get(movie, 'ref_id')
        Bull.add(MovieTmdbUpdateJob.key, {
          id: refId
        })
        // console.log(refId)
      }
    } catch (e) {
			const dataLogs = {
        title: 'MovieUpdate-Task',
        path: 'App/Tasks/MovieUpdate',
        channel: 'tasks',
        message: e.message,
				data: e,
      }
			LogRepository.fire(dataLogs)
    }
  }
}

module.exports = MovieUpdate
