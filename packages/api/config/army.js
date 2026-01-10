'use strict'

const Env = use('Env')
// const Config = use('Config')

module.exports = {
  adspowerServers: [
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
    // {
    //   name: `adspower-03`,
    //   endpoint: Env.get('ADSPOWER_03_ENDPOINT'),
    //   limit: Env.get('ADSPOWER_03_LIMIT'),
    // },
  ],
  goLoginServers: [
    {
      name: `gologin`,
      endpoint: Env.get('GOLOGIN_ENDPOINT'),
      limit: 0,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTVmY2FiMGM2MDcwOTA5YmEzMzIzOGUiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2NTVmY2U2MzgwYjQyZmZjNDBiMjlmMDUifQ.pwCk_yVmRMpGIO-7Oyjbk1-moUYfiBt9yjXfuDEViek'
    },
    {
      name: `gologin-01`,
      endpoint: Env.get('GOLOGIN_01_ENDPOINT'),
      limit: parseInt(Env.get('GOLOGIN_01_LIMIT')),
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTYwYmM5MjZhMjcxM2RiNjk5MjFkMjIiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2NTYxZGZkZGI3ZWNkZTYwYzcyMGE2Y2YifQ.dnML_5zeNJaNw--NEq5fXAc_ok_HRVm6kx_dTwZJT84'
    },
    {
      name: `gologin-02`,
      endpoint: Env.get('GOLOGIN_02_ENDPOINT'),
      limit: parseInt(Env.get('GOLOGIN_02_LIMIT')),
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTYwYmNhNDgxMjY5MDM2NDk3YzFiMTAiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2NTYxZGZkZTU4ZjYwNmM5NDMxNDA5OGQifQ.GtjqmGhiCfbu4XgIIgG2LVceWazVevr_iODupTmZEac'
    },
    // {
    //   name: `gologin-03`,
    //   endpoint: Env.get('GOLOGIN_03_ENDPOINT'),
    //   limit: Env.get('GOLOGIN_03_LIMIT'),
    // },
  ],
  proxies: [
    {
      name: `proxy-01`,
      endpoint: Env.get('ADSPROXY_01_ENDPOINT'),
    }
  ]
}
