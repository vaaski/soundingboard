import type { SocketServer } from "~/types/socket.io"

export const socketHandler = (io: SocketServer) => {
	io.on("playSound", (key) => {
		console.log(`playSound ${key}`)
	})
}
