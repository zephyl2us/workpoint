'use strict'

const _ = use('lodash')
const moment = use('moment')
const Config = use('Config')
const Redis = use('Redis')
const Bull = use('Bull')
const Helper = use('App/Helper')
const CryptoJS = use("crypto-js")
const fs = use('fs')

class PhotoController {

	static get inject() {
		return [
			'App/Repositories/ArmyAntRepository',
			'App/Repositories/ArmyPhotoRepository',
			'App/Repositories/Army/ImageRepository',
		]
	}

	constructor(ArmyAntRepository, ArmyPhotoRepository, ImageRepository) {
    this.ArmyAntRepository = ArmyAntRepository
    this.ArmyPhotoRepository = ArmyPhotoRepository
		this.ImageRepository = ImageRepository
	}

  async index ({request, response}) {
		const currentPage = request.input('page', 1)
		const userId = request.input('user_id', null)
		// const search = request.input('search')

		const filter = _.assign({}, request.only(['id', 'gender', 'age_range']), {
			created_user_id: userId
		})

		const armyAdminId = request.input('army_ant_id')
		if(armyAdminId) {
			filter.army_ant_id = armyAdminId === 'true' ? true : false
		}

    let photos = await this.ArmyPhotoRepository
			.browse({ filter: filter })
			.with('creator')
			.with('ant', (builder) => {
				builder.with('creator')
			})
			.paginate(currentPage)

    return response.status(200).json({
      records: _.get(photos.toJSON(), 'data'),
      pagination: Helper.pager(photos),
    })
  }

	async store ({ auth, request, response }) {
		const authUser = auth.user
		const userId = authUser.id
		const props = request.all()
		const tempId = request.input('id')

		props.created_user_id = userId

		// console.log(props)

		const photo = await this.ArmyPhotoRepository.create(props)

		if(!photo) {
      return response.status(400).json({
				code: 'army.create_photo_failed',
        message: 'Create photo failed'
      })
		}

		const photoId = photo.id

		const photoLinks = await this.ImageRepository.updatePhotoFromTemp(photoId, tempId)

		// console.log(photoLinks)

		photo.payload = {
			photos: photoLinks
		}

		await photo.save()

		return response.ok({
			status: 'success',
			code: 'army_photo_created',
			record: photo
		})
	}

	async stats ({ request, response, params }) {
		// console.log('stats')
		const stats = await this.ArmyPhotoRepository.stats()
		
		return response.ok({
			stats: stats
		})
	}

	async view ({ request, response, params }) {
		const id = params.id

		const filter = {
			id: id
		}

		let ant = await this.ArmyPhotoRepository
			.browse({ filter: filter })
			.with('ant')
			.with('creator', (builder) => {
				builder
				.select('id', 'display_name', 'username')
			})
			.first()

    if(!ant) {
      return response.status(404).json({
        message: 'request.army_photo.notfound'
      })
    }

		ant = ant.toJSON()

    return response.status(200).json({
      record: ant
    })
	}

	async update ({ auth, request, response, params }) {
		const photo = await this.ArmyPhotoRepository.findBy('id', params.id)

		const authUser = auth.user
		const props = request.all()
		
		const updated = await this.ArmyPhotoRepository.update(photo, props)

		const photoId = photo.id

		return response.ok({
			status: 'success',
			code: 'army_photo_updated',
			record: updated
		})
	}

	async sync ({ auth, request, response, params }) {
		const photo = await this.ArmyPhotoRepository.findBy('id', params.id)

		const armyAntId = request.input('army_ant_id')

		const checkAnt = await this.ArmyPhotoRepository.browse({filter: {
			army_ant_id: armyAntId
		}}).first()

		if(checkAnt) {
      return response.status(400).json({
				code: 'army.ant_already_photo',
        message: 'Ant already photo'
      })
		}

		const data = {
			army_ant_id: armyAntId
		}
		
		const updated = await this.ArmyPhotoRepository.update(photo, data)
		let payload = _.get(photo, 'payload')

		if(!_.isObject(payload)) {
			payload = JSON.parse(payload)
		}

		// console.log(photo)

		const profilePath = _.get(payload, 'photos.0')
		// console.log(profilePath)

		if(profilePath) {
			const ant = await this.ArmyAntRepository.findBy('id', armyAntId)
			await this.ArmyAntRepository.update(ant, {
				profile_path: profilePath
			})
		}

		const photoId = photo.id

		return response.ok({
			status: 'success',
			code: 'army_photo_synced',
			record: updated
		})
	}


  async storeImage ({request, response}) {

		const tempId = request.input('id')
		const imgFile = request.file('file')
		const fileStream = fs.createReadStream(imgFile.tmpPath)
		const res = await this.ImageRepository.uploadPhotoToTemp(tempId, fileStream)

		return response.status(res.status).json({
			code: res.message
		})

  }

	async destroyImage({ request, response }) {
		const photo = request.input('photo')
		if (photo) {
			const res = await ImageRepository.softDelete(photo)
			if (res) return response.ok({
				status: 'success',
				code: 'army_photo_deleted'
			})
		}
		
		return response.status(400).json({
			code: 'delete_photo_failed',
			message: 'Delete Photo Failed'
		})
	}
}

module.exports = PhotoController
