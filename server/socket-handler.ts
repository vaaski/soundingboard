import type { SocketServer } from "~/types/socket.io"

let edge = false

export const socketHandler = (io: SocketServer) => {
	io.on("connection", (socket) => {
		socket.emit("setEdge", edge)

		socket.on("playSound", (key) => {
			io.emit("playSound", key)
		})

		socket.on("stopSound", (key) => {
			io.emit("stopSound", key)
		})

		socket.on("setEdge", (value) => {
			edge = value
			io.emit("setEdge", value)
		})
	})
}
