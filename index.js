// Draft of telegram bot for CRT

var pgConnector=require('./pgnode.js')

process.on('uncaughtException', (err) => {
  console.error('whoops! there was an error');
});

