'use strict'

const Env = use('Env')
// const Config = use('Config')

module.exports = {
  servers: [
    {
      name: `adspower-01`,
      endpoint: Env.get('ADSPOWER_01_ENDPOINT'),
      limit: Env.get('ADSPOWER_01_LIMIT'),
    },
    {
      name: `adspower-02`,
      endpoint: Env.get('ADSPOWER_02_ENDPOINT'),
      limit: Env.get('ADSPOWER_02_LIMIT'),
    },
    {
      name: `adspower-03`,
      endpoint: Env.get('ADSPOWER_03_ENDPOINT'),
      limit: Env.get('ADSPOWER_03_LIMIT'),
    },
    // {
    //   name: `adspower-04`,
    //   endpoint: Env.get('ADSPOWER_03_ENDPOINT'),
    //   limit: Env.get('ADSPOWER_03_LIMIT'),
    // },
    // {
    //   name: `adspower-05`,
    //   endpoint: Env.get('ADSPOWER_03_ENDPOINT'),
    //   limit: Env.get('ADSPOWER_03_LIMIT'),
    // },
  ],
  proxies: [
    {
      name: `proxy-01`,
      endpoint: Env.get('ADSPROXY_01_ENDPOINT'),
    }
  ]
}
