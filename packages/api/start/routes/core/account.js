'use strict'

const Route = use('Route')

Route.group(() => {
  Route.patch('security/password', 'SecurityController.changePassword')
    .validator('AccountSecurityPasswordUpdate')
})
.namespace('Core/Account')
.prefix('core/account')
.middleware(['auth', 'shield:core'])