/* cspell:disable */
const SOUND_MAP = {
	"1": "lois.mp3",
	"2": "tyrone.mp3",
	"3": "slidewhistle.mp3",
	"4": "ph.mp3",
	"5": "ahooga.mp3",
	"6": "wii.mp3",
	"7": "boing.mp3",
	"8": "warning.mp3",
	"9": "clap.mp3",
	ä: "augh.mp3",
	a: "newaugh.mp3",
	b: "bruh.mp3",
	c: "car.mp3",
	d: "freddy.mp3",
	e: "failbob.mp3",
	f: "fart.mp3",
	g: "amogus.mp3",
	h: "scream.mp3",
	i: "ahh.mp3",
	j: "failhorn.mp3",
	k: "hellskitchen.mp3",
	l: "metalpipe.mp3",
	m: "amongus.mp3",
	n: "samsung.mp3",
	o: "huh.mp3",
	ö: "wth.mp3",
	p: "bass.mp3",
	q: "squid.mp3",
	r: "brain.mp3",
	s: "sus.mp3",
	t: "running.mp3",
	u: "uy.mp3",
	ü: "womp.mp3",
	v: "vineboom.mp3",
	w: "wetfart.mp3",
	x: "taco.mp3",
	y: "crying.mp3",
	z: "buzzer.mp3",
}
/* cspell:enable */
const SOUNDS = new Map(Object.entries(SOUND_MAP))

let singleInstanceLock = false
export class Soundboard {
	// private socket: FrontFuckSocket
	constructor() {
		if (singleInstanceLock) throw new Error("soundboard already initialized")

		singleInstanceLock = true
		globalThis.addEventListener("keydown", this.onKeydown)

		// socket.on("playSound", (key) => {
		//   if (!this.#sharedModeEnabled) return

		//   const stop = this.playSound(key)
		//   socket.once("stopSound", stop)
		// })
	}

	public readonly sounds = SOUNDS
	public static readonly sounds = SOUNDS
	private initialized = false
	private audioContext?: AudioContext
	private audioElements = new Map<string, EdgeableAudio>()
	public edge = false

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

		return () => {
			if (this.edge) selectedAudio.reverse()
			else selectedAudio.stop()
		}
	}

	#sharedModeEnabled = false
	get sharedModeEnabled() {
		return this.#sharedModeEnabled
	}
	set sharedModeEnabled(value) {
		this.setSharedMode(value)
		this.#sharedModeEnabled = value
	}

	private setSharedMode = (enabled: boolean) => {
		console.log("setSharedMode", enabled)
		// this.socket.emit("setSharedSoundboard", enabled)
	}

	private onKeydown = (downEvent: KeyboardEvent) => {
		if (!this.active) return
		if (downEvent.repeat) return

		if (downEvent.altKey || downEvent.shiftKey) return
		if (downEvent.metaKey || downEvent.ctrlKey) return

		const selectedAudio = this.audioElements.get(downEvent.key)
		if (!selectedAudio) return

		downEvent.preventDefault()
		downEvent.stopPropagation()

		let stop: () => void
		if (this.#sharedModeEnabled) {
			// this.socket.emit("playSound", downEvent.key)
		} else {
			stop = this.playSound(downEvent.key)
		}

		const onKeyup = (upEvent: KeyboardEvent): void => {
			if (upEvent.key !== downEvent.key) return
			globalThis.removeEventListener("keyup", onKeyup)

			if (this.#sharedModeEnabled) {
				// this.socket.emit("stopSound")
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
