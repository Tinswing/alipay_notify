const WebSocket = require('ws')
const url = require('url')

const wsserver = {
	wss: null,
	initSocket: function(server) {
		const wss = new WebSocket.Server({
			server: server, // 将注册函数绑定到 httpServer 上
			verifyClient: function(info) {
				const param = url.parse(info.req.url, true).query
				if (param.name && !wss.isOnline(param.name)) {
					info.req.connection.connectionName = param.name
					return true
				}
				return false
			}
		})

		wsserver.wss = wss
		
		wss.sendMessage = (name, message) => {
			for (let ws of wss.clients) {
				if (ws._sender._socket.connectionName === name) {
					if (ws.readyState === WebSocket.OPEN) {
						ws.send(message)
					}
					break
				}
			}
		}

		// 判断用户是否在线
		wss.isOnline = (name) => {
			for (let ws of wss.clients) {
				if (ws._sender._socket.connectionName === name && ws.readyState === WebSocket.OPEN) {
					return ws
				}
			}
			return null
		}
		
		// 找到用户
		wss.findAll = function(name) {
			let users = new Set()
			for (let ws of wss.clients) {
				if (ws._sender._socket.connectionName === name && ws.readyState === WebSocket.OPEN) {
					users.add(ws)
					if (users.size > 10) { break }
				}
			}
			return users.size > 0 ? users : null
		}

		// 群发消息
		wss.sendGroup = function(message) {
			for (let ws of wss.clients) {
				if (ws.readyState === WebSocket.OPEN) {
					ws.send(message)
				}
			}
		}

		wss.on('connection', function connection(ws) {
			ws.send(`【${ws._sender._socket.connectionName}】 您已经成功连接^.^`)

		    ws.on('message', function incoming(message) {
		    	// 判断消息类型

		    	// 根据消息类型处理回复
		    	switch(info.type) {
					case 'send_chat_message':  // 客户端发送消息
						chat.sendChatMessage(ws, info, wss)
						break
					default:
						return
		    	}
		    })

		    ws.on('close', function(e) {

		    })
		})

		console.log('ws_running....')
		return wss
	}
}

module.exports = wsserver