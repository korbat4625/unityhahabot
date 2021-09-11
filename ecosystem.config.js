module.exports = {
  apps : [{
    script: 'index.js',
    watch: '.'
  }, {
    script: './service-worker/',
    watch: ['./service-worker']
  }],

  deploy : {
    production : {
      user : 'korbat4625@gmail.com',
      host : 'https://unityhahabot.herokuapp.com/',
      ref  : 'origin/master',
      repo : 'https://git.heroku.com/unityhahabot.git',
      path : 'https://unityhahabot.herokuapp.com/',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
