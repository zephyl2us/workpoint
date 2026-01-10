module.exports = {
    apps : [
      // Production
      {
        name: 'api',
        script: './server.js',
        instances: 0,
        exec_mode: 'cluster',
        env: {
          COMMON_VARIABLE: 'true'
        },
        env_production: {
          NODE_ENV: 'production'
        },
        autorestart: true,
        error_file: './storage/logs/web-err.log',
        out_file: './storage/logs/web-out.log'
      },
      {
        name: 'web',
        script: 'npm',
        args: ['start'],
        instances: 0,
        exec_mode: 'cluster',
        env: {
          COMMON_VARIABLE: 'true'
        },
        env_production: {
          NODE_ENV: 'production'
        },
        autorestart: true,
        error_file: './storage/logs/web-err.log',
        out_file: './storage/logs/web-out.log'
      },
      {
        name: 'cron',
        cwd: '/home/ubuntu/workpoint/current/packages/api',
        script: '/home/ubuntu/.nvm/versions/node/v14.21.3/bin/adonis',
        script: 'adonis',
        args: ['run:scheduler'],
        instances: 1,
        exec_mode: 'fork',
        env_production: {
          NODE_ENV: 'production',
          PATH: '/home/ubuntu/.nvm/versions/node/v14.21.3/bin:/usr/local/bin:/usr/bin:/bin'
        },
        autorestart: true,
        error_file: './storage/logs/cron-err.log',
        out_file: './storage/logs/cron-out.log'
      },
      {
        name: 'worker-general',
        cwd: '/home/ubuntu/workpoint/current/packages/api',
        script: '/home/ubuntu/.nvm/versions/node/v14.21.3/bin/adonis',
        args: ['bull:listen', '--rejects=AdsPower-job,GoLogin-job,MovieSource-job,MovieSourceSync-job,MovieTranscode-job'],
        instances: 4,
        exec_mode: 'fork',
        env_production: {
          NODE_ENV: 'production',
          PATH: '/home/ubuntu/.nvm/versions/node/v14.21.3/bin:/usr/local/bin:/usr/bin:/bin'
        },
        autorestart: true,
        error_file: './storage/logs/worker-err.log',
        out_file: './storage/logs/worker-out.log'
      },
    ],
  
    deploy : {
      "api": {
        "user" : "ubuntu",
        "host" : ["146.190.89.193"],
        "key"  : "~/.ssh/workpoint",
        "ref"  : "origin/main",
        "repo" : "git@github.com:zephyl2us/workpoint.git",
        "path" : "/home/ubuntu/workpoint",
        "post-setup": "cp packages/api/.env.production packages/api/.env",
        "pre-deploy-local" : "echo 'This is a local executed command'",
        "post-deploy" : 'cp packages/api/.env.production packages/api/.env && source /home/ubuntu/.nvm/nvm.sh && nvm use v14.21.3 && cd packages/api && npm install && pm2 startOrRestart ./../../ecosystem.config.js --env production --only api',
        "env_production" : {
          "NODE_ENV": "production",
          "ENV_PATH": "./env"
        }
      },
      "web": {
        "user" : "ubuntu",
        "host" : ["143.198.205.229"],
        "key"  : "~/.ssh/workpoint",
        "ref"  : "origin/main",
        "repo" : "git@github.com:zephyl2us/workpoint.git",
        "path" : "/home/ubuntu/workpoint",
        "post-setup": "cp packages/web/.env.production packages/web/.env",
        "pre-deploy-local" : "echo 'This is a local executed command'",
        "post-deploy" : 'cp packages/web/.env.production packages/web/.env && source /home/ubuntu/.nvm/nvm.sh && nvm use v14.21.3 && cd packages/web && npm install && npm run build && pm2 startOrRestart ./../../ecosystem.config.js --env production --only web',
        "env_production" : {
          "NODE_ENV": "production",
          "ENV_PATH": "./env"
        }
      },
      "cron": {
        "user" : "ubuntu",
        "host" : ["152.42.235.96"],
        "key"  : "~/.ssh/workpoint",
        "ref"  : "origin/main",
        "repo" : "git@github.com:zephyl2us/workpoint.git",
        "path" : "/home/ubuntu/workpoint",
        "post-setup": "cp packages/api/.env.production packages/api/.env",
        "pre-deploy-local" : "echo 'This is a local executed command'",
        "post-deploy" : 'cp packages/api/.env.production packages/api/.env && source /home/ubuntu/.nvm/nvm.sh && nvm use v14.21.3 && cd packages/api && npm install && pm2 startOrRestart ./../../ecosystem.config.js --env production --only cron',
        "env_production" : {
          "NODE_ENV": "production",
          "ENV_PATH": "./env"
        }
      },
      "worker": {
        "user" : "ubuntu",
        "host" : ["152.42.242.215", "104.248.158.136"],
        "key"  : "~/.ssh/workpoint",
        "ref"  : "origin/main",
        "repo" : "git@github.com:zephyl2us/workpoint.git",
        "path" : "/home/ubuntu/workpoint",
        "post-setup": "cp packages/api/.env.production packages/api/.env",
        "pre-deploy-local" : "echo 'This is a local executed command'",
        "post-deploy" : 'cp packages/api/.env.production packages/api/.env && source /home/ubuntu/.nvm/nvm.sh && nvm use v14.21.3 && cd packages/api && npm install && pm2 startOrRestart ./../../ecosystem.config.js --env production --only worker-general',
        "env_production" : {
          "NODE_ENV": "production",
          "ENV_PATH": "./env"
        }
      },
    }
  };
  