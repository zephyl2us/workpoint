'use strict'

const Route = use('Route')

Route.group(() => {
  Route.patch('security/password', 'SecurityController.changePassword')
    .validator('Mobile/AccountSecurityPasswordUpdate')
})
.namespace('Account')
.prefix('v1/:app')
.middleware(['auth'])