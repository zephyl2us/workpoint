'use strict'

const _ = use('lodash')
const md5 = use('md5')
const fs = use('fs')
const Env = use('Env')
const Bull = use('Bull')
const Redis = use('Redis')
const Pusher = use('Pusher')
const MovieSourceJob = use('App/Jobs/MovieSource')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const SourceRepository = make('App/Repositories/Movie/SourceRepository')

class MovieSourceSync {
  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'MovieSourceSync-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const RedisTemp = Redis.connection('temp')

		try {
      const movieDirectory = Env.getOrFail('MOVIE_SOURCE_DIRECTORY')
      const tempDirectory = Env.getOrFail('MOVIE_TEMP_DIRECTORY')
      const tempFile = `${tempDirectory}/movie.list`
      
      if (!fs.existsSync(tempDirectory)){
        fs.mkdirSync(tempDirectory)
      }

      // const command = `find "${movieDirectory}/Test" -type f -name "*.mkv" -print > ${tempFile}`
      // const command = `find "${movieDirectory}/Inter Movie" "${movieDirectory}/Cartoon" -type f -name "*.mkv" -print > ${tempFile}`
      const command = `find "${movieDirectory}/Inter Movie" "${movieDirectory}/Cartoon" -type f -name "*.mkv" -ls -print > ${tempFile}`
      // const command = `find "${movieDirectory}/Inter Movie/Boxset" -type f -name "*.mkv" -ls -print > ${tempFile}`
      
      const exec = await SourceRepository.exec(command)
    
      const movieFile = fs.readFileSync(tempFile, 'utf8')
  
      const files = movieFile.split("\n")
  
      let movieAll = 0
      // let movieCount = 0
      // let yearNotfound = 0
      // let resolutionNotfound = 0
      let movies = []
  
      for(let i = 1; i < _.size(files); i+=2) {
        movieAll++
  
        let ls = files[i - 1]
        ls = _.split(ls, ' /')[0]
        // console.log(ls)
        const sizeFound = ls.match(/[0-9]{9,11}/g)
        const size = _.get(_.slice(sizeFound, -1), 0) || null
  
        let file = files[i]
  
        file = _.replace(file, movieDirectory, "")
        const paths = file.split("/")
        const path = _.join(_.slice(paths, 0, _.size(paths) - 1), '/')
        const fileName = paths[_.size(paths) - 1]
  
        if(fileName && path) {
          const source = {
            hash: md5(fileName),
            file: fileName,
            path: path,
            size: size
          }
  
          const data = SourceRepository.generateSourceDetail(source)
          // console.log(data)
          // if(!data.year) {
          //   // console.error(fileName)
          //   yearNotfound++
          // }
          // if(!data.resolution) {
          //   // console.error(fileName)
          //   resolutionNotfound++
          // }
  
          // movieCount++
          movies.push(data)
  
          Bull.add(MovieSourceJob.key, data)
        }
      }

      const totalMovie = _.size(movies)
  
      // Pusher Total Movie
      RedisTemp.set(SourceRepository.currentKey, 0)
      RedisTemp.set(SourceRepository.totalKey, totalMovie)

      Pusher.trigger(`movie.source`, 'sync', {
        name: null,
        current: null,
        total: totalMovie
      })
  
      // console.log(movies)
  
      // console.log(`Total Movie:`, _.size(movies))
      // console.log(`Year not found:`, yearNotfound)
      // console.log(`Resolution not found:`, resolutionNotfound)
		} catch (e) {
			const dataLogs = {
				title: 'MovieSourceSync-job',
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

module.exports = MovieSourceSync
