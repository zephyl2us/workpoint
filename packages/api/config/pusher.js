'use strict'

/*
|--------------------------------------------------------------------------
| Puhser Configuaration
|--------------------------------------------------------------------------
|
| Here we define the configuration for pusher server. A single application
| can make use of multiple redis connections using the pusher provider.
|
*/

const Env = use('Env')

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | connection
  |--------------------------------------------------------------------------
  |
  | Pusher connection to be used by default.
  |
  */
  connection: 'local',

  /*
  |--------------------------------------------------------------------------
  | local connection config
  |--------------------------------------------------------------------------
  |
  | Configuration for a named connection.
  |
  */
  local: {
    appId: Env.get('PUSHER_APP_ID'),
    key: Env.get('PUSHER_APP_KEY'),
    secret: Env.get('PUSHER_APP_SECRET'),
    cluster: Env.get('PUSHER_APP_CLUSTER', 'ap1'),
    useTLS: true
  },

  another: {
    appId: '',
    key: '',
    secret: '',
    cluster: 'ap1',
    useTLS: true
  }
}
