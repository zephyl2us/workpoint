'use strict'

const moment = require("moment/moment")

const _ = use('lodash')
const Config = use('Config')
const langdetect = use('langdetect')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const MovieRepository = make('App/Repositories/Movie/MovieRepository')
// const TmdbRepository = make('App/Repositories/Movie/TmdbRepository')
const TmdbRequestRepository = make('App/Repositories/Movie/TmdbRequestRepository')

class MovieTmdbVideo {
  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'MovieTmdbVideo-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const { data } = job

		const delay = Config.get(`movie.tmdbDelay`)
    await new Promise(r => setTimeout(r, delay))

		try {
      const id = data.id

      const requestMovieVideo = await TmdbRequestRepository.requestMovieVideoById(id)
      const requestMovieVideoTh = await TmdbRequestRepository.requestMovieVideoById(id, { language: 'th-TH'})

      const enVideos = _.get(requestMovieVideo, 'results') || []
      const thVideos = _.get(requestMovieVideoTh, 'results') || []

      const videos = enVideos.concat(thVideos)

      const filter = {
        ref_id: id
      }
      let movie = await MovieRepository.browse({ filter }).with('videos').first()
      movie = movie.toJSON()
      const movieId = movie.id

      const movieVideos = _.get(movie, 'videos')
      const videoRefIds = _.map(movieVideos, (video) => video.ref_id)

      for(let i = 0; i < _.size(videos); i++) {
        const video = videos[i]
        const refId = video.id

        if(_.includes(videoRefIds, refId)) {
          continue
        }

        const site = _.toLower(_.get(video, 'site'))
        const type = _.snakeCase(_.get(video, 'type'))

        if(site !== 'youtube') {
          continue
        }

        const publishedAt = _.get(video, 'published_at')

        const data = {
          ref_id: refId,
          type: type,
          name: _.get(video, 'name'),
          site: site,
          key: _.get(video, 'key'),
          size: parseInt(_.get(video, 'size')),
          lang: _.get(video, 'iso_639_1'),
          official: video.official ? 1 : 0,
          published_at: publishedAt ? moment(publishedAt).format('YYYY-MM-DD HH:mm:ss') : null,
        }

        await MovieRepository.createVideo(movieId, data)
      }
		} catch (e) {
			const dataLogs = {
				title: 'MovieTmdbVideo-job',
				path: 'app/Jobs',
				channel: 'kue',
				message: e.message,
				data: e,
				params: data
			}
			LogRepository.fire(dataLogs)
		}
  }

  async onCompleted(job, result) {
    // console.log('Job Compleate...', result)
  }
}

module.exports = MovieTmdbVideo
