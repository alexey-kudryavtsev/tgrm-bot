// Draft of telegram bot for CRT

var pgConnector=require('./pgnode.js')
var Telegraf=require('telegraf')
var fs = require('fs')
var qrscan = require('./qrscan.js')

// Prevent crashing on errors
process.on('uncaughtException', (err) => {
  console.error('whoops! there was an error '+err);
});

// Create bot webhook
var botToken='318594533:AAGNCFcA9dz7LI1V9GyAqOofqBOoTjTvVzU'
var bot = new Telegraf(botToken,
	{
	  telegram: {           // Telegram options
		agent: null,        // https.Agent instance, allows custom proxy, certificate, keep alive, etc.
		webhookReply: true  // Reply via webhook
	  } 
	}
);

// Specify keys for TLS
const tlsOptions = {
  key: fs.readFileSync('/home/ubuntu/tele_git/YOURPRIVATE.key'),
  cert: fs.readFileSync('/home/ubuntu/tele_git/pub_key.pem')
};

// User instance (actually, chat with S3 user) constructor
function User(userName, loginStatus) {
	this.userName=userName
	this.loginStatus=loginStatus
}

// Array of bot users
var loggedUsers = []

// Function to download and decode QR-photo
function parseQRPhoto(ctx) {
	return (r)=>{
		var QRCode = qrscan.decodeQRCode('https://api.telegram.org/file/bot'+botToken+'/'+r.file_path, (QRCode) => {
		if(QRCode==='') {ctx.reply('No QR Code is found. Try another photo')} else {ctx.reply('QR code is '+ QRCode)}})
	}
}

// Function to check if user has authentication for chatting
function updateLoginStatus(ctx, nextAction) {
	if(loggedUsers[ctx.chat.id]===undefined) {loggedUsers[ctx.chat.id] = new User(undefined, 0)}
	loginStatus = loggedUsers[ctx.chat.id].loginStatus
	
	switch(loginStatus) {
		case 0:
			ctx.reply("You ara not yet logged in S3 system. Please enter your user name for T2 account:")
			loggedUsers[ctx.chat.id].loginStatus=1
			break;
		case 1:
			loggedUsers[ctx.chat.id].userName=ctx.message.text
			ctx.reply("Now enter your password:")
			loggedUsers[ctx.chat.id].loginStatus=2
			break;
		case 2:
			pgConnector.checkPassword(loggedUsers[ctx.chat.id].userName,ctx.message.text).then((checkResult)=>{
				if (checkResult) {loggedUsers[ctx.chat.id].loginStatus=3; ctx.reply("You have successfully logged in");} else {loggedUsers[ctx.chat.id].loginStatus=0; ctx.reply("Login or password is wrong");}
			}
				)
			break;
		case 3:
			nextAction(ctx)
			break;
		default:
			ctx.reply("Server-side error, log in again")
			loggedUsers[ctx.chat.id].loginStatus=0
			updateLoginStatus(ctx,()=>{})
	}

}

// Initialize user on start command and try to authenticate
bot.command('start', (ctx) => {
	if(loggedUsers[ctx.chat.id]===undefined) {
		loggedUsers[ctx.chat.id]=new User(undefined, 0)
	}
	
	updateLoginStatus(ctx,(ctx)=>{ctx.reply('You are logged in as *' + loggedUsers[ctx.chat.id].userName +'*',{	parse_mode:'Markdown'})})
		
})

// Specific action for QR-photo
bot.on("photo", function(ctx) {updateLoginStatus(ctx,function(ctx) {
	bot.telegram.getFile(ctx.message.photo[ctx.message.photo.length-1].file_id).then(parseQRPhoto(ctx))})})

// Generic action
bot.on("message",function(ctx){
		updateLoginStatus(ctx,()=>{})
	})
	

bot.startWebhook('/', tlsOptions, 443);
