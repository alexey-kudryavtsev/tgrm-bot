// Bot reactions in different circumstances

var qrscan = require('./qrscan.js')

// Function to download and decode QR-photo
function parseQRPhoto(ctx, botToken) {
	return (r)=>{
		var QRCode = qrscan.decodeQRCode('https://api.telegram.org/file/bot'+botToken+'/'+r.file_path, (QRCode) => {
		if(QRCode==='') {ctx.reply('No QR Code is found. Try another photo')} else {ctx.reply('QR code is '+ QRCode)}})
	}
}

module.exports.parseQRPhoto=parseQRPhoto