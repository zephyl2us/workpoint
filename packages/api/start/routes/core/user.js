'use strict'

const Route = use('Route')

Route.group(() => {

  Route.get('creator', 'CreatorController.index')

  Route.get('staff', 'StaffController.index')
    .middleware(['acl:setting.user.view'])

  Route.post('staff/create', 'StaffController.store')
    .validator('UserStore')
    .middleware(['acl:setting.user.create'])
    
  Route.get('staff/permission', 'StaffController.permission')
    .middleware(['acl:setting.user.edit'])

  Route.get('staff/:id', 'StaffController.view')
    .middleware(['acl:setting.user.view'])

  Route.patch('staff/:id', 'StaffController.update')
    .middleware(['acl:setting.user.edit'])

})
.namespace('Core/User')
.prefix('core/user')
.middleware(['auth', 'shield:core'])