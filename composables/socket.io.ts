import { io } from "socket.io-client"
import type { SocketClient } from "~/types/socket.io"

let socket: SocketClient | undefined
let socketUsers = 0

export const useSocket = () => {
	if (!socket) {
		socket = io()
	}

	socketUsers++

	onUnmounted(() => {
		socketUsers--
		if (socketUsers === 0) {
			socket?.disconnect()
			socket = undefined
		}
	})

	return socket
}
