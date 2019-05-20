const http = require('http')
const bodyParser = require('./util/body-parser.js')
const socket = require('./websocket.js')

// 支付宝异步通知支付结果处理函数
const alipayNotifyHandler = async (req, res) => {
	const result = await bodyParser(req)

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
	if (req.url === '/alipay_notify' && req.method === 'POST') {
		return alipayNotifyHandler(req, res)
	}

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

/*
{
  gmt_create: '2019-05-15 01:05:47',
  charset: 'UTF-8',
  subject: 'Iphone6 16G',
  sign:
   'pXgfl5jHocEarbdG0Bcgf7hG8jwMjRRExi7T8vukVa8DuJtJs0kZH2M+MY78esCkqe1w3eZVCSD59WIgborjLz/o+QguNxWSi5d59xqAjmAEQMFByO90vMNdQsjB5K8tqLJss40wFaMyDibO6CPO+gXXLGctVy7z2V1jAb1+iJP3jKToIe7e3AQsDVQTVwOmyZUO3ibfaYeb4KB9nUTGit9cmajq3pfubGDfZBVus/k9OPg6uVxo1BInjo5ka6rxfNN2uOiXxrcCZOKYThLk18jave8QxHDMpLXzXkFnwDzk2PMWaKTrySTjW4TyIygCiBTYhgKdmYg3pabb//edCw==',
  buyer_id: '2088102177364717',
  body: 'Iphone6 16G',
  invoice_amount: '10.00',
  notify_id: '2019051500222010554064711000212787',
  fund_bill_list: '[{"amount":"10.00","fundChannel":"ALIPAYACCOUNT"}]',
  notify_type: 'trade_status_sync',
  trade_status: 'TRADE_SUCCESS',
  receipt_amount: '10.00',
  app_id: '2016092400588540',
  buyer_pay_amount: '10.00',
  sign_type: 'RSA2',
  seller_id: '2088102177118435',
  gmt_payment: '2019-05-15 01:05:54',
  notify_time: '2019-05-15 01:05:55',
  passback_params: '可能否',
  version: '1.0',
  out_trade_no: '4894561632',
  total_amount: '10.00',
  trade_no: '2019051522001464711000051831',
  auth_app_id: '2016092400588540',
  point_amount: '0.00' 
}
 */