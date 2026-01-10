'use strict'

const Route = use('Route')

Route.group(() => {
  Route.get('katei/reward', 'KateiController.index')
})
.namespace('Core/Extra')
.prefix('core/extra')

Route.group(() => {
  // Route.get('katei/reward', 'KateiController.index')
  //   .middleware(['acl:extra.katei.view'])

  Route.patch('katei/reward', 'KateiController.update')
    .middleware(['acl:extra.katei.edit'])


    Route.get('one', 'OneController.index')
    .middleware(['acl:extra.one.view'])

    // Route.get('one/export', 'OneController.export')
    // .middleware(['acl:extra.one.export'])

})
.namespace('Core/Extra')
.prefix('core/extra')
.middleware(['auth', 'shield:core'])


Route.group(() => {
  Route.get('one/export', 'OneController.export')

})
.namespace('Core/Extra')
.prefix('core/extra')
// .middleware(['auth', 'shield:core'])

