'use strict'

const Route = use('Route')



Route.group(() => {
  Route.get('*', 'ImageController.image')
})
.prefix('image')