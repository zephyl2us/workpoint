'use strict'

const { Command } = require('@adonisjs/ace')
const _ = use('lodash')
const moment = use('moment')
const Bull = use('Bull')
const MovieTranscodeJob = use('App/Jobs/MovieTranscode')
const MovieMediaRepository = make('App/Repositories/Movie/MovieMediaRepository')

class MovieReTranscode extends Command {
  static get signature () {
    return 'movie:retranscode'
  }

  static get description () {
    return 'Tell something helpful about this command'
  }

  async handle (args, options) {
    // this.info('Dummy implementation for movie:update command')
		const filter = {
      status: 'error'
    }

    let medias = await MovieMediaRepository
			.browse({ filter: filter })
      // .select('id', 'ref_id')
      // .where('ref_id', 385687)
      // .limit(1)
			.fetch()

		medias = medias.toJSON()

    // console.log(`Total movie: `, _.size(medias))

		for(let i = 0; i < _.size(medias); i++) {
      const media = medias[i]
      const id = _.get(media, 'id')
      const refId = _.get(media, 'mdb_movie_id')
      const audios = _.get(media, 'transcode_audio')
      // console.log(id)

      Bull.add(MovieTranscodeJob.key, {
        id: id,
        audios: audios
      })
    }
  }
}

module.exports = MovieReTranscode
