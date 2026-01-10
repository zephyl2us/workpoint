'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Filter = use('App/Models/Filters/ArmyAntFilter')
const Sorter = use('App/Models/Sorters/ArmyAntSorter')
const moment = use('moment')

class ArmyAnt extends Model {
  static boot () {
    super.boot()

    this.addTrait('@provider:Filterable', Filter)
    this.addTrait('@provider:Sortable', Sorter)
		this.addTrait('@provider:Lucid/SoftDeletes')
    
    this.addHook('beforeSave', async (data) => {
    })

    this.addHook('afterFind', async (data) => {
      data.birthday = moment(data.birthday).format('YYYY-MM-DD')
    })

    this.addHook('afterFetch', async (data) => {
      for (let item of data) {
        item.birthday = moment(item.birthday).format('YYYY-MM-DD')
      }
    })
  }

  creator () {
    return this.belongsTo('App/Models/User', 'created_user_id', 'id')
	}

  photo () {
    return this.hasOne('App/Models/ArmyPhoto')
	}

  passwords () {
    return this.hasMany('App/Models/ArmyAntSecurity')
	}

  bots() {
    return this.hasMany('App/Models/ArmyAntBot', 'id', 'army_ant_id')
  }

  // latest_bot () {
  //   return this.hasMany('App/Models/ArmyAntBot')
  //     .orderBy('id', 'desc')
  //     .limit(1)
	// }

  // latest_bot () {
  //   return this.hasMany('App/Models/ArmyAntBot')
  //   .select('App/Models/ArmyAntBot.*')
  //   .fromRaw('(SELECT *, ROW_NUMBER() OVER (PARTITION BY `army_ant_id` ORDER BY `id` DESC) as rn FROM bs) as bot')
  //   .where('rn', 1)
  //   .where('army_ant_id', this.id)
	// }

}

module.exports = ArmyAnt
