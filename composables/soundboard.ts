import type { SocketClient } from "~/types/socket.io"

/* cspell:disable */
const SOUND_MAP = {
	"0": "snore.mp3",
	"1": "lois.mp3",
	"2": "tyrone.mp3",
	"3": "slidewhistle.mp3",
	"4": "ph.mp3",
	"5": "ahooga.mp3",
	"6": "wii.mp3",
	"7": "boing.mp3",
	"8": "warning.mp3",
	"9": "clap.mp3",
	A: "alarm.mp3",
	ä: "augh.mp3",
	a: "newaugh.mp3",
	b: "bruh.mp3",
	B: "drill.mp3",
	c: "car.mp3",
	C: "chirp.mp3",
	D: "danger.mp3",
	d: "freddy.mp3",
	e: "failbob.mp3",
	E: "raugh.mp3",
	f: "fart.mp3",
	F: "fish.mp3",
	g: "amogus.mp3",
	G: "getout.mp3",
	H: "laugh.mp3",
	h: "scream.mp3",
	i: "ahh.mp3",
	I: "screenshot.mp3",
	j: "failhorn.mp3",
	k: "hellskitchen.mp3",
	L: "lobotomy.mp3",
	l: "metalpipe.mp3",
	m: "amongus.mp3",
	M: "moan.mp3",
	N: "21.mp3",
	n: "samsung.mp3",
	o: "huh.mp3",
	O: "league.mp3",
	Ö: "ohmygod.mp3",
	ö: "wth.mp3",
	p: "bass.mp3",
	P: "pluh.mp3",
	q: "squid.mp3",
	Q: "flashbang.mp3",
	r: "brain.mp3",
	R: "riff.mp3",
	S: "stroking.mp3",
	s: "sus.mp3",
	t: "running.mp3",
	U: "skeleton.mp3",
	u: "uy.mp3",
	ü: "womp.mp3",
	v: "vineboom.mp3",
	w: "wetfart.mp3",
	W: "what.mp3",
	x: "taco.mp3",
	Y: "correct.mp3",
	y: "crying.mp3",
	z: "buzzer.mp3",
}
/* cspell:enable */
const SOUNDS = new Map(Object.entries(SOUND_MAP))

let singleInstanceLock = false
export class Soundboard {
	constructor(private socket: SocketClient) {
		if (singleInstanceLock) throw new Error("soundboard already initialized")

		singleInstanceLock = true
		globalThis.addEventListener("keydown", this.onKeydown, {
			signal: this.keydownAbort.signal,
		})

		socket.on("playSound", (key) => {
			if (!this.sharedModeEnabled) return

			const stop = this.playSound(key)
			this.playingSounds.set(key, stop)
		})

		socket.on("stopSound", (stopKey) => {
			const handler = this.playingSounds.get(stopKey)
			if (handler) {
				this.playingSounds.delete(stopKey)
				handler()
			}
		})
	}

	public readonly sounds = SOUNDS
	public static readonly sounds = SOUNDS

	private playingSounds = new Map<string, () => void>()

	private initialized = false
	private audioContext?: AudioContext
	private audioElements = new Map<string, EdgeableAudio>()

	public edge = false
	public sharedModeEnabled = false
	public playbackRate = 1

	private keydownAbort = new AbortController()

	public deactivate = () => {
		this.keydownAbort.abort()
		singleInstanceLock = false
		this.#active = false
	}

	#active = false
	public get active() {
		return this.#active
	}
	public set active(value) {
		this.#active = value
		if (value && !this.initialized) {
			this.initialize()
		}
	}

	public playSound = (key: string) => {
		const selectedAudio = this.audioElements.get(key)
		if (!selectedAudio) throw new Error(`remote sound ${key} not found`)

		selectedAudio.play()
		if (selectedAudio.currentSourceNode) {
			selectedAudio.currentSourceNode.playbackRate.value = this.playbackRate
		}

		return () => {
			if (this.edge) {
				selectedAudio.reverse()
				if (selectedAudio.currentSourceNode) {
					selectedAudio.currentSourceNode.playbackRate.value = this.playbackRate
				}
			} else selectedAudio.stop()
		}
	}

	private onKeydown = (downEvent: KeyboardEvent) => {
		if (!this.active) return
		if (downEvent.repeat) return

		if (downEvent.altKey) return
		if (downEvent.metaKey || downEvent.ctrlKey) return

		const selectedAudio = this.audioElements.get(downEvent.key)
		if (!selectedAudio) return

		downEvent.preventDefault()
		downEvent.stopPropagation()

		let stop: () => void
		if (this.sharedModeEnabled) {
			this.socket.emit("playSound", downEvent.key)
		} else {
			stop = this.playSound(downEvent.key)
		}

		const onKeyup = (upEvent: KeyboardEvent): void => {
			if (upEvent.key !== downEvent.key) return
			globalThis.removeEventListener("keyup", onKeyup)

			if (this.sharedModeEnabled) {
				this.socket.emit("stopSound", downEvent.key)
			} else {
				stop()
			}
		}
		globalThis.addEventListener("keyup", onKeyup)
	}

	loadSound = async (path: string, audioContext: AudioContext) => {
		const audio = await fetch(`/sound/${path}`)
		const arrayBuffer = await audio.arrayBuffer()
		const edgeableAudio = new EdgeableAudio(audioContext)
		return await edgeableAudio.load(arrayBuffer)
	}

	private initialize = () => {
		if (this.initialized) return

		this.initialized = true
		this.audioContext = new AudioContext()

		for (const [key, path] of SOUNDS) {
			this.loadSound(path, this.audioContext).then((audio) => {
				this.audioElements.set(key, audio)
			})
		}
	}
}

export const canPlay = async () => {
	// eslint-disable-next-line unicorn/prefer-global-this
	if (!window) return false

	const audio = new Audio(`/sound/augh.mp3`)
	audio.muted = true

	try {
		await audio.play()
		audio.pause()

		return true
	} catch {
		return false
	}
}
