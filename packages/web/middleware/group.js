'use strict'

import _ from 'lodash'

export default function (ctx) {
	// console.log('group')
  if (ctx.$auth.loggedIn) {
		const authUser = ctx.$auth.user
		const group =  authUser.group

		// console.log(authUser)

		if(_.includes(['god', 'admin'], group)) {
			return ctx.redirect(`/admin`)
		}

		return ctx.redirect(`/`)
  }
}
