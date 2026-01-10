'use strict'

const Event = use('Event')

// const Redis = use('Redis')
// Redis.subscribe('my-channel-1', 'Example.newTrack')

// User
Event.on('user::created', 'User.created')
Event.on('user::updated', 'User.updated')
Event.on('user::deleted', 'User.deleted')
Event.on('user::registered', 'User.registered')