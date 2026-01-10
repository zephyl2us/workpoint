'use strict'

const _ = use('lodash')
const moment = use('moment')
const Env = use('Env')
const Pusher = use('Pusher')
const os = require('os')
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const Helper = make('App/Helper')
const LogRepository = make('App/Repositories/LogRepository')
const MovieMediaRepository = make('App/Repositories/Movie/MovieMediaRepository')

let progressPercent = null
class MovieTranscode {
  // static get connection() {
  //   return "remote";
  // }

  static get concurrency() {
    return 1
  }

  static get options() {
    return {
      removeOnComplete: true,
    }
  }

  static get key() {
    return 'MovieTranscode-job'
  }

  // This is where the work is done.
  async handle(job) {
    if(Helper.isDebugJob()) console.log(_.get(job, 'queue.name'))
    
    const { data } = job

    progressPercent = null
    const movieDirectory = Env.getOrFail('MOVIE_SOURCE_DIRECTORY')
    const outputDirectory = Env.getOrFail('MOVIE_STREAM_DIRECTORY')

		try {
      // const media = _.get(data, 'media')
      const mediaId = _.get(data, 'id')
      const audios = _.get(data, 'audios')

      // console.log(data)

      let media = await MovieMediaRepository
        .browse({
          filter: {
            id: mediaId,
            // resolution: resolution
          }
        })
        .with('movie')
        .with('source')
        .first()

      if(!media) {
        return false
      }

      media = media.toJSON()

      const movie = _.get(media, 'movie')
      const source = _.get(media, 'source')
      // console.log(media)

      if(!_.get(movie, 'id')) {
        // console.log(`Media #${mediaId}: Can't find movie.`)
        return false
      }
      if(!_.get(source, 'id')) {
        // console.log(`Media #${mediaId}: Can't find source.`)
        return false
      }

      const videoOptions = {
        sd: {
          resolution: 'sd',
          size: 720,
          bit_rate: '384k',
          audio_rate: '256000'
        },
        hd: {
          resolution: 'hd',
          size: 1280,
          bit_rate: '768k',
          audio_rate: '384000'
        },
        fhd: {
          resolution: 'fhd',
          size: 1920,
          bit_rate: '1536k',
          audio_rate: '384000'
        }
      }
  
      const resolution = _.get(media, 'resolution')
      const option = _.get(videoOptions, resolution)
      // console.log(videoOptions)
      // console.log(resolution)

      // console.log(option)

      if(!_.isObject(option)) {
        // console.log(`Media #${mediaId}: Can't find resolution.`)
        return false
      }
  
      const fileInput = `${movieDirectory}${source.path}/${source.file}`
      const fileOutputPath = `${outputDirectory}/${source.hash}-${resolution}`
      const fileOutput = `${fileOutputPath}/video.mp4`
  
      if (!fs.existsSync(fileOutputPath)){
        fs.mkdirSync(fileOutputPath)
      }

      await this.makePlaylist(fileOutputPath, option, audios)

      let outputOptions = [
        // '-ss 00:33:50',
        // '-to 00:36:38',
        '-map 0:v:0',
      ]

      _.each(audios, (audio, index) => {
        outputOptions.push(`-map 0:a:${audio.index}`)
        outputOptions.push(`-c:a:${index} aac`)
        outputOptions.push(`-metadata:s:a:${index} language=${audio.language}`)

        const language = Helper.iso6393ToCountry(audio.language)
        outputOptions.push(`-metadata:s:a:${index} title=${language}`)
      })

      outputOptions.push(`-disposition:a:0 default`)

      // console.log(outputOptions)

      const findMedia = await MovieMediaRepository.find(mediaId)

      const title = _.get(media, 'movie.original_title')
      await this.ffmpegSync(findMedia, title, fileInput, fileOutput, outputOptions, option)

		} catch (e) {
			const dataLogs = {
				title: 'MovieTranscode-job',
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

  async ffmpegSync(media, title, fileInput, fileOutput, outputOptions, option) {
    return new Promise((resolve,reject)=>{
      ffmpeg(fileInput)
        .outputOptions(outputOptions)
        .videoCodec('libx264')
        .videoBitrate(option.bit_rate)
        .size(`${option.size}x?`)
        .audioChannels(2)
        .audioCodec('aac')
        .audioBitrate(option.audio_rate)
        .format('mp4')
        .on('start', async function() {
          // console.log(`Start convert: ${title}`)
          // console.log(audios)
          const transcodeAt = moment().format('YYYY-MM-DD HH:mm:ss')
          await MovieMediaRepository.update(media, {
            status: 'transcoding',
            transcode_server: os.hostname(),
            transcode_at: transcodeAt
          })
          Pusher.trigger(`movie.media`, `transcode-progress`, {
            id: media.id,
            resolution: media.resolution,
            transcode_server: os.hostname(),
            transcode_at: transcodeAt,
            progress: {}
          })
        })
        .on('progress', function(progress) {
          // console.log(progress)
          // console.log('Processing: ' + progress.percent + '% done')

          const percent = Math.floor(progress.percent * 10)
          if(progressPercent === null || progressPercent < percent) {
            progressPercent = percent
            // console.log('Processing: ' + (progressPercent / 10) + '% done')
            Pusher.trigger(`movie.media`, `transcode-progress`, {
              id: media.id,
              resolution: media.resolution,
              transcode_server: os.hostname(),
              progress: progress
            })
          }
        })
        .on('end', async function() {
          // console.log(`${title} has been converted succesfully`)
          const movieUpdated = await MovieMediaRepository.update(media, {
            status: 'completed',
            completed_at: moment().format('YYYY-MM-DD HH:mm:ss')
          })
          Pusher.trigger(`movie.media`, `transcode-completed`, movieUpdated)
          resolve()
        })
        .on('error', async function(err) {
          // console.log('An error occurred: ' + err.message)
          await MovieMediaRepository.update(media, {
            status: 'error',
            status_info: err.message
          })
          return reject(new Error(err))
        })
        .save(fileOutput)
    })
  }

  async makePlaylist (fileOutputPath, video, audios) {
    const playlistOutput = `${fileOutputPath}/playlist.smil`

    // console.log(playlistOutput)
    // console.log(video)
    // console.log(audios)

    let content = `<smil><head></head><body><switch>`

    // Add audio
    const audioBitRate = video.audio_rate

    _.each(audios, (audio, index) => {
      // const title = Helper.iso6393ToCountry(audio.language)
      const title = _.upperCase(audio.language)
      content += `
      <video src="mp4:video.mp4?audioindex=${index}" title="${title}" audio-bitrate="${audioBitRate}">
        <param name="audioOnly" value="TRUE" valuetype="data"/>
        <param name="cupertinoTag" value="EXT-X-MEDIA" valuetype="data"/>
        <param name="cupertinoTag.GROUP-ID" value="aac" valuetype="data"/>
        <param name="cupertinoTag.DEFAULT" value="NO" valuetype="data"/>
      </video>`
    })

    // Add video
    let videoBitRate = `${video.bit_rate}`
    videoBitRate = _.replace(videoBitRate, 'k', '')
    videoBitRate = parseInt(videoBitRate) * 1024

    content += `
    <video src="mp4:video.mp4" video-bitrate="${videoBitRate}">
      <param name="videoCodecId" value="avc1.66.30" valuetype="data"/>
      <param name="videoOnly" value="TRUE" valuetype="data"/>
      <param name="cupertinoTag.AUDIO" value="aac" valuetype="data"/>
      <param name="audioCodecId" value="mp4a.40.2" valuetype="data"/>
    </video>`

    content += `</switch></body></smil>`

    fs.writeFile(playlistOutput, content, err => {})
  }
}

module.exports = MovieTranscode
