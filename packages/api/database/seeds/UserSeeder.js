'use strict'

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

class UserSeeder {

  static get inject() {
    return [
      'App/Repositories/UserRepository',
    ]
  }

  constructor(UserRepository) {
    this.UserRepository = UserRepository
  }

  async run() {

    const users = [
      {
        id: 1,
        group: 'god',
        username: 'god',
        display_name: 'God',
        password: 'password',
        status: 'active'
      },
      {
        id: 2,
        group: 'admin',
        username: 'admin',
        display_name: 'Admin',
        password: 'password',
        status: 'active'
      },
      {
        id: 3,
        group: 'member',
        username: 'member',
        display_name: 'Member',
        password: 'password',
        status: 'active'
      },
    ]

    for (let i in users) {
      const data = users[i]
      const user = await this.UserRepository.create(data)
      console.log('user: ', user)
    }
  }
}

module.exports = UserSeeder
