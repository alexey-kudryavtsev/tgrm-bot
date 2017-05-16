// QR-code and barcode scanning module

var qrcode = require('jsqr')
var https = require('https')
var jpeg = require('jpeg-js')


function decodeQRCode (link, callback) {
	var image;
	var qrText="";
	https.get(link, function(res) {

	   var buffers = '';
	   var length = 0;
	   res.setEncoding('binary')
	   res.on("data", function(chunk) {

		  // store each block of data
		  length += chunk.length;
		  buffers += chunk;
	   });

	   res.on("end", function() {

		  // combine the binary data into single buffer
		  image = new Buffer(buffers, 'binary')
		  // finally, extract QR from photo
		  parseResult({img: image, qr:qrText, callbackFun:callback})
	   })
	})

}

function parseResult(obj) {

	//convert jpeg photo to RGBA point array
	var rawImageData = jpeg.decode(obj.img,true)

	//convert to BW image
	var binarizedImage = qrcode.binarizeImage(rawImageData.data, rawImageData.width, rawImageData.height);

	// find QR-code
	var location = qrcode.locateQRInBinaryImage(binarizedImage);

	if (!location) {
		obj.qr=''
		return
	}
	
	// extract QR-code
	var rawQR = qrcode.extractQRFromBinaryImage(binarizedImage, location);
	if (!rawQR) {
	  obj.qr=''
	  return
	}
	
	// decode QR to text
	var decodedQR = qrcode.decodeQR(rawQR);
	obj.qr=decodedQR;
	obj.callbackFun(obj.qr)
}

module.exports.decodeQRCode = decodeQRCode;