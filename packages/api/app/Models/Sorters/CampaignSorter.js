'use strict'

const ModelSorter = use('ModelSorter')

class CampaignSorter extends ModelSorter {

  static get sortable () {
    return  [
      'id'
    ]
  }

}

module.exports = CampaignSorter
