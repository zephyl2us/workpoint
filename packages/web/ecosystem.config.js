module.exports = {
    apps : [
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
    ],
  
    deploy : {
      "web": {
        "user" : "ubuntu",
        "host" : ["157.245.198.199"],
        "key"  : "~/.ssh/megatron",
        "ref"  : "origin/main",
        "repo" : "git@github.com:zephyl2us/megatron-admin.git",
        "path" : "/home/ubuntu/megatron-admin",
        // "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
        "post-setup": "cp .env.production .env",
        "pre-deploy-local" : "echo 'This is a local executed command'",
        "post-deploy" : 'cp .env.production .env && source /home/ubuntu/.nvm/nvm.sh && nvm use v14.21.3 && npm install && npm run build && pm2 startOrRestart ecosystem.config.js --env production --only web',
        "env_production" : {
          "NODE_ENV": "production",
          "ENV_PATH": "./env"
        }
      },
    }
  };
  