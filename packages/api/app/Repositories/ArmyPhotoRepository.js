'use strict'

const _ = use('lodash')
const moment = use('moment')
// const Cache = use('Cache')
const Redis = use('Redis')
// const Config = use('Config')
// const Event = use('Event')
const Helper = use('App/Helper')
const Database = use('Database')
const Pusher = use('Pusher')
// const LogRepository = make('App/Repositories/LogRepository')

class ArmyPhotoRepository {

  static get inject() {
    return [
      'App/Models/ArmyAnt',
      'App/Models/ArmyPhoto',
      'App/Repositories/ArmyAntRepository',
    ]
  }

  constructor(ArmyAnt, ArmyPhoto, ArmyAntRepository) {
    this.ArmyAnt = ArmyAnt
    this.ArmyPhoto = ArmyPhoto
    this.ArmyAntRepository = ArmyAntRepository
  }

	browse({ filter = {}, sort = 'id|desc', options = { db: 'write' } } = {}) {
		const sorter = Helper.convertSplitterToObject(sort)
		const CurrentModel = Helper.clusterDb('ArmyPhoto', {
			mode: options.db
		})

		return CurrentModel.query().filter(filter).sorter(sorter)
	}

	async find(id) {
		return await Cache.model(this.ArmyPhoto, `army_photo:${id}`, 60, async () => {
			return await this.ArmyPhoto.findOrFail(id)
		})
	}

	async findBy(field, value) {
		return await this.ArmyPhoto.findByOrFail(field, value)
	}

  async create(data) {
    let photo = new this.ArmyPhoto()

    photo = _.assign(photo, _.pick(data, [
      'army_ant_id',
      'age_range',
      'source_url',
      'gender',
      'payload',
      'created_user_id',
    ]))

    if(await photo.save()) {
      return photo
    }
    return false
  }

  async update(photo, data) {

    photo = _.assign(photo, _.pick(data, [
      'army_ant_id',
      'age_range',
      'source_url',
      'gender',
      'payload',
      // 'created_user_id',
    ]))
    
    // console.log(photo, data)

    if (await photo.save()) {
      return photo
    }

    return false
  }

  async delete(photo) {
    if (await photo.delete()) {
      return photo
    }

    return false
  }

  async stats () {

    // const totalPhoto = await this.browse({ filter: {
    //   age_range: 2
    // }}).getCount()

    const stats = {
      male: {},
      female: {}
    }

    let ants = await this.ArmyAntRepository.browse({})
      .select('id', 'gender', 'birthday')
      // .limit(100)
      .fetch()

    ants = ants.toJSON()

    let photos = await this.browse({})
      .select('id', 'army_ant_id', 'gender', 'age_range')
      .fetch()

    photos = photos.toJSON()

    const photoByAnts = {}
    _.each(photos, (photo) => {
      const antId = photo.army_ant_id
      const gender = photo.gender
      const ageRange = photo.age_range

      let ageKey = null
      switch (ageRange) {
        case 2: ageKey = 'twenty'; break
        case 3: ageKey = 'thirty'; break
        case 4: ageKey = 'forty'; break
        case 5: ageKey = 'fifty'; break
        case 6: ageKey = 'sixty'; break
      }

      if(!ageKey) return true

      if(_.has(stats, `${gender}.${ageKey}`)) {
        stats[gender][ageKey].total += 1
      } else {
        stats[gender][ageKey] = {
          available: 0,
          unset: 0,
          used: 0,
          total: 1
        }
      }

      if(antId) {
        stats[gender][ageKey].used += 1
      } else {
        stats[gender][ageKey].available += 1
      }

      const antIdString = antId + ''
      photoByAnts[antIdString] = photo
    })

    _.each(ants, (ant) => {
      const id = ant.id
      const gender = ant.gender
      const idString = id + ''
      const antPhoto = _.get(photoByAnts, idString)

      if(antPhoto) return true

      const birthday = ant.birthday
      const diffYear = moment().diff(birthday, 'years')

      let ageKey = null
      if(diffYear < 30) ageKey = 'twenty'
      else if(diffYear < 40) ageKey = 'thirty'
      else if(diffYear < 50) ageKey = 'forty'
      else if(diffYear < 60) ageKey = 'fifty'
      else ageKey = 'sixty'

      if(_.has(stats, `${gender}.${ageKey}`)) {
        stats[gender][ageKey].unset += 1
      } else {
        stats[gender][ageKey] = {
          available: 0,
          unset: 1,
          used: 0,
          total: 0
        }
      }
    })
  
    return stats
  }
}

module.exports = ArmyPhotoRepository
