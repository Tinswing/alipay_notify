const querystring = require('querystring')

module.exports = (req) => new Promise((resolve, reject) => {
	let data = ""
	try {
		req.on('data', chunk => {
			data += chunk
		})

		req.on('end', () => {
			data = decodeURIComponent(data)
			var param = querystring.parse(data)
			resolve(param)
		})
	}catch(err) {
		reject(err)
	}
})