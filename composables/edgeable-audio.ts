export class EdgeableAudio {
	constructor(public readonly context: AudioContext) {}

	#decoded?: AudioBuffer
	#reversed?: AudioBuffer
	#durationMS = 0
	#startTime = 0
	#currentSourceNode?: AudioBufferSourceNode

	public load = async (audioArrayBuffer: ArrayBuffer) => {
		this.#decoded = await this.context.decodeAudioData(audioArrayBuffer)
		this.#reversed = this.#reverseAudioBuffer(this.#decoded)
		this.#durationMS = this.#decoded.duration * 1000

		return this
	}

	public play = () => {
		if (!this.#decoded) throw new Error("Audio not loaded, call .load() first")

		this.#startTime = performance.now()
		this.#playBuffer(this.#decoded)
	}

	public reverse = () => {
		if (!this.#reversed) throw new Error("Audio not loaded, call .load() first")

		const stopTime = performance.now()
		const playDuration = Math.min(stopTime - this.#startTime, this.#durationMS)
		const newStartPoint = (this.#durationMS - playDuration) / 1e3

		this.#currentSourceNode?.stop()
		this.#playBuffer(this.#reversed, newStartPoint)
	}

	public stop = () => {
		this.#currentSourceNode?.stop()
	}

	#playBuffer = (buffer: AudioBuffer, time = 0) => {
		this.#currentSourceNode = this.context.createBufferSource()
		this.#currentSourceNode.buffer = buffer
		this.#currentSourceNode.connect(this.context.destination)
		this.#currentSourceNode.start(0, time)
	}

	#cloneAudioBuffer = (audioBuffer: AudioBuffer) => {
		const channels = []
		const channelCount = audioBuffer.numberOfChannels

		//clone the underlying Float32Arrays
		for (let index = 0; index < channelCount; index++) {
			channels[index] = new Float32Array(audioBuffer.getChannelData(index))
		}

		//create the new AudioBuffer (assuming AudioContext variable is in scope)
		const newBuffer = this.context.createBuffer(
			audioBuffer.numberOfChannels,
			audioBuffer.length,
			audioBuffer.sampleRate,
		)

		//copy the cloned arrays to the new AudioBuffer
		for (let index = 0; index < channelCount; index++) {
			newBuffer.getChannelData(index).set(channels[index])
		}

		return newBuffer
	}

	#reverseAudioBuffer = (buffer: AudioBuffer) => {
		const reversed = this.#cloneAudioBuffer(buffer)

		let currentChannel = 0
		while (currentChannel < reversed.numberOfChannels) {
			const channel = reversed.getChannelData(currentChannel++)
			const length = channel.length - 1
			const length2 = length >>> 1

			for (let index = 0; index < length2; index++) {
				const temporary = channel[length - index]
				channel[length - index] = channel[index]
				channel[index] = temporary
			}
		}

		return reversed
	}
}
