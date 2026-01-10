'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterArmyAntsSchema extends Schema {
  up () {
    this.table('army_ants', (table) => {
      // alter table
      table.string('undetect_id', 32).nullable().unique().after('ref_id')
      table.enu('type', ['cloud', 'local']).defaultTo('local').index().after('undetect_id')
      table.renameColumn('ref_id', 'adspower_id')
      table.string('youtube_id', 50).unique().after('profile_path')
      table.boolean('youtube_enable').defaultTo(0).index().after('youtube_id')
      table.boolean('facebook_enable').defaultTo(0).index().after('facebook_id')
      table.string('instagram_id', 50).unique().after('facebook_enable')
      table.boolean('instagram_enable').defaultTo(0).index().after('instagram_id')
      table.string('tiktok_id', 50).unique().after('instagram_enable')
      table.boolean('tiktok_enable').defaultTo(0).index().after('instagram_enable')
    })
  }

  down () {
    this.table('army_ants', (table) => {
      // reverse alternations
      table.dropColumn('undetect_id')
      table.dropColumn('type')
      table.renameColumn('adspower_id', 'ref_id')
      table.dropColumn('youtube_id')
      table.dropColumn('youtube_enable')
      table.dropColumn('facebook_enable')
      table.dropColumn('instagram_id')
      table.dropColumn('instagram_enable')
      table.dropColumn('tiktok_id')
      table.dropColumn('tiktok_enable')
    })
  }
}

module.exports = AlterArmyAntsSchema
