'use strict'

const _ = use('lodash')
const Gate = use('Gate')

/**
 * Check permission.
 */
Gate.define('access', (user, resource) => {
  const { authPermissions, required } = resource
  return !!~authPermissions.indexOf(required)
})

/**
 * Check the resource is belongs to you or not?
 */
Gate.define('show', (user, resource) => {
  const authData = user.toJSON()
  const groupId = `${_.replace(authData.group, /^sub/, '')}_id`

  const presentId = authData[groupId]
  return _.eq(presentId, resource[groupId])
})

/**
 * Check this content is belongs to me
 */
Gate.define('belongsTo', (user, resource) => {
	const authData = user.toJSON()
	const group = authData.group
	var presentId = authData.id
	if (!_.includes(['god', 'member'], group)) {
  	const groupId = `${_.replace(group, /^sub/, '')}_id`
		presentId = authData[groupId]
	}
  return _.eq(presentId, resource.user_id)
})
