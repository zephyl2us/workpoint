'use strict'

const ModelFilter = use('ModelFilter')

class CampaignUserFilter extends ModelFilter {
  static get dropId () {
    return false
  }

  id (value) {
    return this.where('id', value)
  }

  campaignId (value) {
    return this.where('campaign_id', value)
  }

  actorUserId (value) {
    return this.where('actor_user_id', value)
  }

  status (value) {
    return this.where('status', value)
  }
}

module.exports = CampaignUserFilter
