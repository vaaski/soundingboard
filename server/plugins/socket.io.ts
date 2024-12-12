import type { SocketServer } from "~/types/socket.io"

import { Server as Engine } from "engine.io"
import { Server } from "socket.io"
import { defineEventHandler } from "h3"
import { socketHandler } from "../socket-handler"

export default defineNitroPlugin((nitroApp) => {
	const engine = new Engine()
	const io: SocketServer = new Server()

	io.bind(engine)

	socketHandler(io)
	io.on("connection", (socket) => {
		console.log(`socket connected    ${socket.id}`)

		socket.on("disconnect", () => {
			console.log(`socket disconnected ${socket.id}`)
		})
	})

	nitroApp.router.use(
		"/socket.io/",
		defineEventHandler({
			handler(event) {
				// @ts-expect-error nah idk it works doe
				engine.handleRequest(event.node.req, event.node.res)
				event._handled = true
			},
			websocket: {
				open(peer) {
					// @ts-expect-error private method and property
					engine.prepare(peer._internal.nodeReq)
					// @ts-expect-error private method and property
					engine.onWebSocket(
						// @ts-expect-error private method and property
						peer._internal.nodeReq,
						// @ts-expect-error private method and property
						peer._internal.nodeReq.socket,
						peer.websocket,
					)
				},
			},
		}),
	)
})
