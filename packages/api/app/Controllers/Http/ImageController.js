'use strict'

const _ = use('lodash')
const moment = use('moment')
const Config = use('Config')
const sharp = use('sharp')

class ImageController {

	static get inject() {
		return [
			'App/Repositories/Storage/SpacesRepository',
		]
	}

	constructor(SpacesRepository) {
		this.SpacesRepository = SpacesRepository
	}


	async image({ request, response}) {
		const url = request.url()
		const path = url.substring(7)
		let keyReg = /(photo[\S]+)/g.exec(path)
		if(!keyReg) {
			keyReg = /(checkpoint[\S]+)/g.exec(path)
		}
		const key = keyReg[0]
		const size = _.first(_.split(path, '/'))

		const image = await this.SpacesRepository.getImage(key)
		if(!image) return response.status(400).json({
			message: 'not_found'
		})

		const result = await this.resize(size, image)
		if(result.status === 400) {
			return {
        status: 400,
				message: result.data
			}
		}

		return response.header('Content-Type', 'image/png').send(result.data)
	}

	async resize(size, image) {
		const sizeConfig = Config.get(`movie.imageSize.${size}`)
		if (!sizeConfig) {
			return {
				data: image
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

module.exports = ImageController
