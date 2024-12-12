import type { SocketServer } from "~/types/socket.io"

export const socketHandler = (io: SocketServer) => {
	io.on("connection", (socket) => {
		socket.on("playSound", (key) => {
			io.emit("playSound", key)
		})

		socket.on("stopSound", (key) => {
			io.emit("stopSound", key)
		})
	})
}
