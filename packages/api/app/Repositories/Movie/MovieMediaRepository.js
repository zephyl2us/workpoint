'use strict'

const { path } = require('app-root-path')

const _ = use('lodash')
const moment = use('moment')
const md5 = use('md5')
const fs = use('fs')
const Redis = use('Redis')
const Env = use('Env')
const ffmpeg = use('fluent-ffmpeg')
const langdetect = use('langdetect')
const Pusher = use('Pusher')
const Helper = use('App/Helper')


class MovieMediaRepository {

  static get inject() {
    return [
      'App/Models/MdbMovie',
      'App/Models/MdbMovieMedia',
    ]
  }

  constructor(MdbMovie, MdbMovieMedia) {
    this.Movie = MdbMovie
    this.MovieMedia = MdbMovieMedia

    this.RedisTemp = Redis.connection('temp')

    // this.currentKey = 'movie:source:sync_current'
    // this.totalKey = 'movie:source:sync_total'
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('MdbMovieMedia', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
    return await this.MovieMedia.find(id)
	}

	async findBy(field, value) {
		return await this.MovieMedia.findBy(field, value)
	}

  async create(data) {
    let media = new this.MovieMedia()

    data = _.assign(data, {
      status: 'queuing'
    })

    media = _.assign(media, _.pick(data, [
      'mdb_movie_id',
      'mdb_source_id',
      'hash',
      'resolution',
      'transcode_server',
      'transcode_audio',
      'server',
      'status',
      'created_user_id'
    ]))


    if(await media.save()) {
      return media
    }
    return false
  }

  async update(media, data) {
    media = _.assign(media, _.pick(data, [
      'transcode_server',
      'transcode_audio',
      'size',
      'status',
      'status_info',
      'transcode_at',
      'completed_at'
    ]))
    
    if (await media.save()) {
      return media
    }

    return false
  }

}

module.exports = MovieMediaRepository
