import type { Server } from "socket.io"
import type { Socket } from "socket.io-client"

type ServerToClientEvents = {
	playSound: (key: string) => void
}

type ClientToServerEvents = {
	playSound: (key: string) => void
}

export type SocketServer = Server<ClientToServerEvents, ServerToClientEvents>
export type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>