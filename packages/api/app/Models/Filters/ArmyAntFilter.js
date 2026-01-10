'use strict'

const ModelFilter = use('ModelFilter')

class ArmyAntFilter extends ModelFilter {
  static get dropId () {
    return false
  }

  search (value) {
		return this.where((query) => {
			query.where('email','LIKE',`%${value}%`)
			query.orWhere('national_id','LIKE',`%${value}%`)
			query.orWhere('first_name','LIKE',`%${value}%`)
			query.orWhere('last_name','LIKE',`%${value}%`)
			query.orWhere('first_name_en','LIKE',`%${value}%`)
			query.orWhere('last_name_en','LIKE',`%${value}%`)
			query.orWhere('adspower_id','LIKE',`%${value}%`)
		})
  }

  id (value) {
    return this.where('id', value)
  }

  ids (value) {
    return this.whereIn('id', value)
  }

  createdUserId (value) {
    return this.where('created_user_id', value)
  }

  adspowerId (value) {
    return this.where('adspower_id', value)
  }

  gologinId (value) {
    if(value === true) {
      return this.whereNotNull('gologin_id')
    }
    if(value === false) {
      return this.whereNull('gologin_id')
    }
    return this.where('gologin_id', value)
  }

  tiktokStatus (value) {
    return this.where('tiktok_status', value)
  }

  status (value) {
		return this.where((query) => {
			query.where('gmail_status', value)
			query.orWhere('facebook_status', value)
			query.orWhere('instagram_status', value)
			query.orWhere('tiktok_status', value)
		})
  }

  deploy (value) {
    return this.where('deploy', value)
  }
}

module.exports = ArmyAntFilter
