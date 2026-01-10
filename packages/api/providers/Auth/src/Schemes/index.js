'use strict'

/*
 * adonis-auth
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/
module.exports = {
  session: require('@adonisjs/auth/src/Schemes/Session'),
  basic: require('@adonisjs/auth/src/Schemes/BasicAuth'),
  jwt: require('./Jwt'),
  api: require('./Api')
}
