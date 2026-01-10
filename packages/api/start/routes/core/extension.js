'use strict'

const Route = use('Route')

Route.group(() => {
  Route.get('ant/:id', 'AntController.ant')
  Route.post('ant/bot/:bot_id/stop', 'AntController.forceStop')
  Route.get('ant/bot/:bot_id/activity', 'AntController.getBotActivity')
  Route.post('ant/bot/:bot_id/activity', 'AntController.storeBotActivity')
})
.namespace('Core/Extension')
.prefix('core/extension')
// .middleware(['auth', 'shield:core'])