'use strict'

const Route = use('Route')

Route.group(() => {
  Route.get('address', 'RequestController.addressAll')
  Route.get('generate/person', 'RequestController.generatePerson')

  Route.get('ant', 'AntController.index')
    .middleware(['acl:army.ant.view'])

  Route.post('ant/create', 'AntController.store')
    .validator('ArmyAntStore')
    .middleware(['acl:army.ant.create'])
    
  Route.get('ant/:id', 'AntController.view')
    .middleware(['acl:army.ant.view'])

  Route.patch('ant/:id', 'AntController.update')
    .validator('ArmyAntUpdate')
    .middleware(['acl:army.ant.edit'])

  Route.patch('ant/:id/social', 'AntController.updateSocial')
    .validator('ArmyAntUpdateSocial')
    .middleware(['acl:army.ant.edit'])

  Route.delete('ant/:id', 'AntController.destroy')
    .middleware(['acl:army.ant.delete'])
    
  Route.get('photo', 'PhotoController.index')
    .middleware(['acl:army.photo.view'])

    Route.get('photo/stats', 'PhotoController.stats')
    .middleware(['acl:army.photo.view'])

  Route.post('photo/create', 'PhotoController.store')
    .validator('ArmyPhotoStore')
    .middleware(['acl:army.photo.create'])
  
  Route.get('photo/:id', 'PhotoController.view')
    .middleware(['acl:army.photo.view'])

  Route.patch('photo/:id', 'PhotoController.update')
    .validator('ArmyPhotoUpdate')
    .middleware(['acl:army.photo.edit'])

  Route.patch('photo/:id/sync', 'PhotoController.sync')
    .middleware(['acl:army.photo.edit'])

  Route.delete('photo/:id', 'PhotoController.destroy')
    .middleware(['acl:army.photo.delete'])
    
  Route.put('photo/upload', 'PhotoController.storeImage')
    .middleware(['acl:army.photo.edit'])
  
  Route.delete('photo/upload', 'PhotoController.destroyImage')
    .middleware(['acl:army.photo.edit'])
  
  Route.get('bot', 'BotController.index')
    .middleware(['acl:army.bot.view'])
    
  Route.get('bot/stats', 'BotController.stats')
  .middleware(['acl:army.bot.view'])
  
  Route.get('bot/monitor', 'BotController.monitor')
  .middleware(['acl:army.bot.view'])
  
  Route.post('bot/start', 'BotController.start')
    .middleware(['acl:army.bot.control'])
    
  Route.post('bot/stop', 'BotController.stop')
    .middleware(['acl:army.bot.control'])

  Route.get('proxy', 'ProxyController.index')
  .middleware(['acl:army.proxy.view'])

})
.namespace('Core/Army')
.prefix('core/army')
.middleware(['auth', 'shield:core'])