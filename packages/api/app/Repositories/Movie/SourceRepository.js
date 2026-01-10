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


class SourceRepository {

  static get inject() {
    return [
      'App/Models/MdbMovie',
      'App/Models/MdbSource',
    ]
  }

  constructor(MdbMovie, MdbSource) {
    this.Movie = MdbMovie
    this.Source = MdbSource

    this.RedisTemp = Redis.connection('temp')

    this.currentKey = 'movie:source:sync_current'
    this.totalKey = 'movie:source:sync_total'
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('MdbSource', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
    return await this.Source.find(id)
	}

	async findBy(field, value) {
		return await this.Source.findBy(field, value)
	}

  async create(data) {
    let source = new this.Source()

    source = _.assign(source, _.pick(data, [
      'mdb_movie_id',
      'hash',
      'name',
      'name_en',
      'name_th',
      'year',
      'resolution',
      'file',
      'path',
      'size',
      'info',
    ]))


    if(await source.save()) {
      return source
    }
    return false
  }

  async update(source, data) {
    source = _.assign(source, _.pick(data, [
      'mdb_movie_id',
      'name',
      'name_en',
      'name_th',
      'year',
      'resolution',
      'size',
      'info',
      'transcode_audio'
    ]))
    
    if (await source.save()) {
      return source
    }

    return false
  }

  async sync () {

    return movies
  }

  async syncMovie (data) {
    // console.log(data)

    let source = await this.findBy('hash', data.hash)
    
    const sourceId = _.get(source, 'id')

    if(!_.get(source, 'info')) {
      const movieDirectory = Env.getOrFail('MOVIE_SOURCE_DIRECTORY')
      const sourceFile = `${movieDirectory}${data.path}/${data.file}`

      const sourceInfo = await this.sourceInfo(sourceFile)
      // console.log(sourceInfo)

      data = _.assign({}, data, {
        info: sourceInfo
      })
    }
    
    if(!_.get(source, 'id')) {
      source = await this.create(data)
      source = source.toJSON()

      console.log(`Create ${source.id}:`, source.hash)
    } else {

      source = await this.update(source, data)
      if(source) {
        console.log(`Update ${source.id}:`, source.hash)
      } else {
        console.log(`Skip ${sourceId}:`, data.hash)
      }
    }

    const current = await this.RedisTemp.incr(this.currentKey)
    const total = await this.RedisTemp.get(this.totalKey)

    Pusher.trigger(`movie.source`, 'sync', {
      name: data.file,
      current: parseInt(current),
      total: parseInt(total),
    })

    if(current >= total) {
      await this.RedisTemp.expire(this.currentKey, 60)
      await this.RedisTemp.expire(this.totalKey, 60)
    }
  }

	async sourceInfo (sourceFile) {
    return new Promise((resolve, reject) => {
			ffmpeg.ffprobe(sourceFile, (err, metadata) => {
        if (err) reject(err)
        resolve(metadata)
      })
    })
	}

	async exec (command) {
		const { exec } = require('child_process')
		return new Promise((resolve, reject) => {
		 exec(command, (err, stdout, stderr) => {
			if (err) {
			 console.error(`Exec: Fail to execute command ${command}`)
			 console.error(err)
			 console.error(stderr)
			 return reject(err)
			}
	 
			return resolve(stdout);
		 })
		})
	}

  generateSourceDetail (source) {
    const fileName = source.file
    // const regex = ;
    const yearFound = fileName.match(/(\([1,2][0-9]{3}\)|\[[1,2][0-9]{3}\]|\.[1,2][0-9]{3}\.)/g)
    let year = _.get(yearFound, 0)
    year = _.replace(year, /(\(|\)|\[|\]|\.)/g, '')

    const resolutionFound = fileName.match(/(720|1080|2160|4k)/g)
    let resolution = _.get(resolutionFound, 0)
    resolution = _.replace(resolution, /(\(|\)|\[|\]|\.)/g, '')

    let name = fileName

    if(year) {
      name = _.split(name, year)
    }

    if(resolution) {
      if(_.isArray(name)) {
        name = _.split(name[0], resolution)
      } else {
        name = _.split(name, resolution)
      }
    }

    if(_.isArray(name)) {
      name = name[0]
    }

    name = _.replace(name, /\[$/, '')
    name = _.replace(name, /\($/, '')
    name = _.replace(name, /\.$/, '')
    name = _.replace(name, /\ $/, '')

    name = _.replace(name, /\./g, ' ')

    let index = null
    const splitName = _.split(name, ' ')
    _.each(splitName, (n, i) => {
      const languages = langdetect.detect(n)
      const lang = _.get(languages, `0.lang`)
  
      if(_.eq('th', lang)) {
        index = i
        return false
      }
    })
    // console.log(splitName)

    let nameEn = _.join(_.slice(splitName, 0, index), ' ')
    let nameTh = _.join(_.slice(splitName, index, _.size(splitName)), ' ')

    const languages = langdetect.detect(nameTh)
    const lang = _.get(languages, `0.lang`)

    if(_.eq('en', lang) || !nameEn) {
      const nameTmp = nameEn
      nameEn = nameTh
      nameTh = nameTmp
    }

    const resolutions = {
      720: '720p',
      1080: '1080p',
      2160: '2160p'
    }

    const size = source.size ? Math.floor(source.size / 1024 / 1024) : null

    return _.assign(source, {
      name: name,
      name_en: nameEn,
      name_th: nameTh,
      year: year ? parseInt(year) : null,
      resolution: _.get(resolutions, resolution) || (size > 2048 ? '1080p' : null),
      size: size
    })
  }
}

module.exports = SourceRepository
