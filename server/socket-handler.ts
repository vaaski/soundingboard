import type { SocketServer } from "~/types/socket.io"

let edge = false
let playbackRate = 1

export const socketHandler = (io: SocketServer) => {
	io.on("connection", (socket) => {
		socket.emit("setEdge", edge)
		socket.emit("setPlaybackRate", playbackRate)

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

		socket.on("setPlaybackRate", (value) => {
			playbackRate = value
			io.emit("setPlaybackRate", value)
		})
	})
}
