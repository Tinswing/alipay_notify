const http = require('http')
const bodyParser = require('./util/body-parser.js')
const socket = require('./websocket.js')

// 支付宝异步通知支付结果处理函数
const alipayNotifyHandler = async (req, res) => {
	const result = await bodyParser(req)
	
	console.log(result)

	if (result.trade_status !== 'TRADE_SUCCESS') { return }

	const name = decodeURIComponent(result.passback_params)

	if (socket.wss) {
		const ws = socket.wss.isOnline(name)
		if (ws) {
			// 发送客户端消息支付成功
			ws.send('pay_success')
		}
	}
	// 回复支付宝服务器通知成功
	res.writeHead(200, {'Content-Type': 'text-plain;charset=UTF-8'})
	res.end('success')
}

const server = http.createServer((req, res) => {
	// 确认路径和请求方法
	// if (req.url === '/alipay_notify' && req.method === 'POST') {
		console.log(req.url, req.method)
		return alipayNotifyHandler(req, res)
	// }

	res.writeHead(404, {'Content-Type': 'text-plain;charset=UTF-8'})
	res.end('404 没有找到')
})

const PORT = 8888

server.listen(PORT, (err) => {
	if (err) {
		return console.error(err)
	}
	console.log(`listen ${PORT}...`)
})

socket.initSocket(server)