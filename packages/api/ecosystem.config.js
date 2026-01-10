module.exports = {
    apps : [
      {
        name: 'web-staging',
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
        name: 'cron',
        script: 'adonis',
        args: ['run:scheduler'],
        instances: 1,
        exec_mode: 'cluster',
        env_production: {
          NODE_ENV: 'production'
        },
        autorestart: true,
        error_file: './storage/logs/cron-err.log',
        out_file: './storage/logs/cron-out.log'
      },
      {
        name: 'worker-general',
        script: 'adonis',
        args: [
          'bull:listen', 
          "--rejects=AdsPower-job,GoLogin-job,MovieSource-job,MovieSourceSync-job,MovieTranscode-job"
        ],
        instances: 0,
        exec_mode: 'fork',
        env_production: {
          NODE_ENV: 'production'
        },
        autorestart: true,
        error_file: './storage/logs/worker-err.log',
        out_file: './storage/logs/worker-out.log'
      },
      {
        name: 'worker-adspower',
        script: 'adonis',
        args: [
          'bull:listen', 
          "--accepts=AdsPower-job,GoLogin-job"
        ],
        instances: 2,
        exec_mode: 'cluster',
        env_production: {
          NODE_ENV: 'production'
        },
        autorestart: true,
        error_file: './storage/logs/worker-err.log',
        out_file: './storage/logs/worker-out.log'
      },
      {
        name: 'worker-transcode',
        script: 'adonis',
        args: [
          'bull:listen', 
          "--accepts=MovieSource-job,MovieSourceSync-job,MovieTranscode-job"
        ],
        instances: 2,
        exec_mode: 'cluster',
        env_production: {
          NODE_ENV: 'production'
        },
        autorestart: true,
        error_file: './storage/logs/worker-err.log',
        out_file: './storage/logs/worker-out.log'
      },
    ],
  
    deploy : {
      // "service": {
      //   "user" : "ubuntu",
      //   "host" : ["165.22.48.178"],
      //   "key"  : "~/.ssh/megatron",
      //   "ref"  : "origin/main",
      //   "repo" : "git@github.com:zephyl2us/megatron-core.git",
      //   "path" : "/home/ubuntu/megatron-core",
      //   // "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
      //   "post-setup": "cp .env.production .env",
      //   "pre-deploy-local" : "echo 'This is a local executed command'",
      //   "post-deploy" : 'cp .env.production .env && npm install && pm2 startOrRestart ecosystem.config.js --env production',
      //   "env_production" : {
      //     "NODE_ENV": "production",
      //     "ENV_PATH": "./env"
      //   }
      // },
      "web-staging": {
        "user" : "ubuntu",
        "host" : ["159.223.46.31"],
        "key"  : "~/.ssh/megatron",
        "ref"  : "origin/main",
        "repo" : "git@github.com:zephyl2us/megatron-core.git",
        "path" : "/home/ubuntu/megatron-core",
        // "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
        "post-setup": "cp .env.production .env",
        "pre-deploy-local" : "echo 'This is a local executed command'",
        "post-deploy" : 'cp .env.production .env && source /home/ubuntu/.nvm/nvm.sh && nvm use v14.21.3 && npm install && pm2 startOrRestart ecosystem.config.js --env production --only web-staging',
        "env_production" : {
          "NODE_ENV": "production",
          "ENV_PATH": "./env"
        }
      },
      "web": {
        "user" : "ubuntu",
        // "host" : ["165.22.57.49", "206.189.150.189"],
        "host" : ["128.199.148.241", "128.199.153.154"],
        "key"  : "~/.ssh/megatron",
        "ref"  : "origin/main",
        "repo" : "git@github.com:zephyl2us/megatron-core.git",
        "path" : "/home/ubuntu/megatron-core",
        // "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
        "post-setup": "cp .env.production .env",
        "pre-deploy-local" : "echo 'This is a local executed command'",
        "post-deploy" : 'cp .env.production .env && source /home/ubuntu/.nvm/nvm.sh && nvm use v14.21.3 && npm install && pm2 startOrRestart ecosystem.config.js --env production --only web',
        "env_production" : {
          "NODE_ENV": "production",
          "ENV_PATH": "./env"
        }
      },
      "cron": {
        "user" : "ubuntu",
        "host" : ["206.189.150.122"],
        "key"  : "~/.ssh/megatron",
        "ref"  : "origin/main",
        "repo" : "git@github.com:zephyl2us/megatron-core.git",
        "path" : "/home/ubuntu/megatron-core",
        // "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
        "post-setup": "cp .env.production .env",
        "pre-deploy-local" : "echo 'This is a local executed command'",
        "post-deploy" : 'cp .env.production .env && source /home/ubuntu/.nvm/nvm.sh && nvm use v14.21.3 && npm install && pm2 startOrRestart ecosystem.config.js --env production --only cron',
        "env_production" : {
          "NODE_ENV": "production",
          "ENV_PATH": "./env"
        }
      },
      "worker": {
        "user" : "ubuntu",
        "host" : ["128.199.156.167", "128.199.156.154"],
        "key"  : "~/.ssh/megatron",
        "ref"  : "origin/main",
        "repo" : "git@github.com:zephyl2us/megatron-core.git",
        "path" : "/home/ubuntu/megatron-core",
        // "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
        "post-setup": "cp .env.production .env",
        "pre-deploy-local" : "echo 'This is a local executed command'",
        "post-deploy" : 'cp .env.production .env && source /home/ubuntu/.nvm/nvm.sh && nvm use v14.21.3 && npm install && pm2 startOrRestart ecosystem.config.js --env production --only worker-general',
        "env_production" : {
          "NODE_ENV": "production",
          "ENV_PATH": "./env"
        }
      },
      "adspower": {
        "user" : "ubuntu",
        "host" : ["167.71.222.196"],
        "key"  : "~/.ssh/megatron",
        "ref"  : "origin/main",
        "repo" : "git@github.com:zephyl2us/megatron-core.git",
        "path" : "/home/ubuntu/megatron-core",
        // "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
        "post-setup": "cp .env.production .env",
        "pre-deploy-local" : "echo 'This is a local executed command'",
        "post-deploy" : 'cp .env.production .env && source /home/ubuntu/.nvm/nvm.sh && nvm use v14.21.3 && npm install && pm2 startOrRestart ecosystem.config.js --env production --only worker-adspower',
        "env_production" : {
          "NODE_ENV": "production",
          "ENV_PATH": "./env"
        }
      },
      "transcode-r630": {
        "user" : "ubuntu",
        "host" : ["103.91.205.17", "103.91.205.18"],
        "key"  : "~/.ssh/megatron",
        "ref"  : "origin/main",
        "repo" : "git@github.com:zephyl2us/megatron-core.git",
        "path" : "/home/ubuntu/megatron-core",
        // "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
        "post-setup": "cp .env.production-public .env",
        "pre-deploy-local" : "echo 'This is a local executed command'",
        "post-deploy" : 'cp .env.production-public .env && source /home/ubuntu/.nvm/nvm.sh && nvm use v14.21.3 && npm install && pm2 startOrRestart ecosystem.config.js --env production --only worker-transcode',
        "env_production" : {
          "NODE_ENV": "production",
          "ENV_PATH": "./env"
        }
      },
      "transcode-r240": {
        "user" : "ubuntu",
        "host" : ["103.91.205.31", "103.91.205.25", "103.91.205.23", "103.91.205.24"],
        "key"  : "~/.ssh/megatron",
        "ref"  : "origin/main",
        "repo" : "git@github.com:zephyl2us/megatron-core.git",
        "path" : "/home/ubuntu/megatron-core",
        // "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
        "post-setup": "cp .env.production-public .env",
        "pre-deploy-local" : "echo 'This is a local executed command'",
        "post-deploy" : 'cp .env.production-public .env && source /home/ubuntu/.nvm/nvm.sh && nvm use v14.21.3 && npm install && pm2 startOrRestart ecosystem.config.js --env production --only worker-transcode',
        "env_production" : {
          "NODE_ENV": "production",
          "ENV_PATH": "./env"
        }
      },
    }
  };
  