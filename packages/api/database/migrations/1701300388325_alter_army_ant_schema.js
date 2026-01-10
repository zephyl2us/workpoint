'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterArmyAntsSchema extends Schema {
  up () {
    this.table('army_ants', (table) => {
      table.renameColumn('youtube_enable', 'youtube_status')
      table.renameColumn('facebook_enable', 'facebook_status')
      table.renameColumn('instagram_enable', 'instagram_status')
      table.renameColumn('tiktok_enable', 'tiktok_status')
    })
  }

  down () {
    this.table('army_ants', (table) => {
      table.renameColumn('youtube_status', 'youtube_enable')
      table.renameColumn('facebook_status', 'facebook_enable')
      table.renameColumn('instagram_status', 'instagram_enable')
      table.renameColumn('tiktok_status', 'tiktok_enable')
    })
  }
}

module.exports = AlterArmyAntsSchema
