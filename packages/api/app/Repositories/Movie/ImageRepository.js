'use strict'

const _ = use('lodash')
const Env = use('Env')
const sharp = use('sharp')
const Config = use('Config')

class ImageRepository {

  static get inject() {
    return [
      'App/Repositories/Storage/SpacesRepository'
    ]
  }

  constructor(SpacesRepository) {
    this.SpacesRepository = SpacesRepository
    this.SpacesRepository.bucket = Env.get('DO_SPACES_MOVIE_BUCKET')
  }

	async getImage(sizeImage, fileName) {

		const collection = `tmdb/${fileName}`
		let image = await this.SpacesRepository.getImage(collection)
		if (!image) {
			const imgBuffer = await this.tmdbGetImage(fileName)
			const options = {
				ALC: 'private',
				Key: collection, 
				Body: imgBuffer,
				ContentType: 'image/jpeg'
			}

			const uploaded = await this.SpacesRepository.s3send('upload', options)
			const status = _.get(uploaded, '$metadata.httpStatusCode')
			if (status !== 200) {
				return {
          status: 400,
					message: 'failed to upload'
				}
			}

			image = imgBuffer
		}

		const result = await this.resize(sizeImage, image)
		if(result.status === 400) {
			return {
        status: 400,
				message: result.data
			}
		}

		return {
      status: 200,
      data: result.data
    }
	}

	async tmdbGetImage(fileName) {

		const url = `https://image.tmdb.org/t/p/original/${fileName}`
		const options = {
			url: url,
			method: 'GET',
			encoding: null
		}

		const response = await rp(options)
		.then(res => {
			return res
		})
		.error(err => {
			return false
		})

		return response
	}

	async resize(size, image) {
		const sizeConfig = Config.get(`movie.imageSize.${size}`)
		if (!sizeConfig) {
			return {
				status: 400,
				message: 'size is not support'
			}
		}

		const { width, height } = await sharp(image).metadata()
		if (sizeConfig.width > width || sizeConfig.height > height) {
			return {
				status: 400,
				message: 'oversize of original size'
			}
		}

		return {
			status: 200,
			data: await sharp(image).resize(sizeConfig).toBuffer()
		}
	}
}

module.exports = ImageRepository
