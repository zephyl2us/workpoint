'use strict'

const moment = require("moment/moment")

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
		this.photoPath = Env.get('DO_SPACES_BUCKET_PATH', 'photo-dev')
		this.checkpointPath = Env.get('DO_SPACES_BUCKET_CHECKPOINT', 'checkpoint-dev')
		
  }

	async uploadPhotoToTemp(tempId, tempImage) {
		const tempSplit = _.split(tempId, '_')
		const id = tempSplit[1]
		let random = (Math.random() + 1).toString(36).substring(2) + moment().format('YYYYMMDDHHmmss')
		const collection = `tmp/${id}/${random}.png`
		const options = {
			ALC: 'private',
			Key: collection, 
			Body: tempImage,
			ContentType: 'image/png'
		}

		const uploaded = await this.SpacesRepository.s3send('upload', options)
		const status = _.get(uploaded, '$metadata.httpStatusCode')
		if (status !== 200) {
			return {
				status: 400,
				message: 'upload_failed'
			}
		}

		return {
			status: 200,
			message: 'upload_success'
		}
	}

	async updatePhotoFromTemp(profileId, tempId) {
		const tempSplit = _.split(tempId, '_')
		const id = tempSplit[1]
		const list = await this.SpacesRepository.s3send('list', { Prefix: `tmp/${id}`})
		const contents = _.get(list, 'Contents') || null
		if (!contents) {
			return []
		}
		let photoPathList = []
		let tempPathList = []
		for(const content of contents) {
			const key = `${this.photoPath}/${profileId}/${_.last(_.split(content.Key, '/'))}`
			const input = {
				ALC: 'private',
				CopySource: `megatron/${content.Key}`,
				Key: key
			}
			const res = await this.SpacesRepository.s3send('copy', input)
			if (_.get(res, '$metadata.httpStatusCode') === 200) {
				photoPathList.push(key)
				tempPathList.push({ Key: content.Key })
			}
		}

		if (!_.isEmpty(tempPathList)) {
			const deleteObject =  {
				Delete: {
					Objects: tempPathList,
					Quiet: false
				}
			}

			await this.SpacesRepository.s3send('deletes', deleteObject)
		}
		
		return photoPathList
	}

	async softDelete(photoKey) {
		const s3delete = async (keys) => {
			let deletePathList = []
			for(const key of keys) {
				const input = {
					ALC: 'private',
					CopySource: `megatron/${key}`,
					Key: `delete/${key}`
				}

				const res = await this.SpacesRepository.s3send('copy', input)
				if (_.get(res, '$metadata.httpStatusCode') === 200) deletePathList.push({ Key: key })
			}

			if (!_.isEmpty(deletePathList)) {
				const deleteObject =  {
					Delete: {
						Objects: deletePathList,
						Quiet: false
					}
				}

				const res = await this.SpacesRepository.s3send('deletes', deleteObject)
				if (_.get(res, '$metadata.httpStatusCode') === 200) return true
				return false
			}

		}

		if (_.isString(photoKey)) {
			photoKey = [photoKey]
		}

		return await s3delete(photoKey)
	}

	async uploadPhotoCheckpoint(botId, image) {
		let timeStampImg = moment().format('YYYYMMDDHHmmss')
		const collection = `${this.checkpointPath}/${botId}/${timeStampImg}.png`
		const options = {
			ALC: 'private',
			Key: collection, 
			Body: image,
			ContentType: 'image/png'
		}

		const uploaded = await this.SpacesRepository.s3send('upload', options)
		const status = _.get(uploaded, '$metadata.httpStatusCode')
		if (status !== 200) {
			return {
				status: 400,
				message: 'upload_failed'
			}
		}

		return {
			status: 200,
			path: collection,
			message: 'upload_success'
		}
	}
}

module.exports = ImageRepository
