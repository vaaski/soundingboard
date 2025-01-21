<script setup lang="ts">
const sounds = Soundboard.sounds
const activated = ref(true)
const globalMode = ref(process.env.NODE_ENV !== "development")
const edgingMode = ref(true)
const playbackRate = ref(1)

let board: Soundboard
let socket: ReturnType<typeof useSocket>
onMounted(() => {
	socket = useSocket()
	board = new Soundboard(socket)
	const activation = new AbortController()

	watch(
		globalMode,
		(value) => {
			board.sharedModeEnabled = value

			if (value) {
				socket.emit("getUpdate", (state) => {
					edgingMode.value = state.edge
					playbackRate.value = state.playbackRate
				})
			}
		},
		{ immediate: true },
	)

	watch(
		edgingMode,
		(value) => {
			board.edge = value
		},
		{ immediate: true },
	)

	watch(
		playbackRate,
		(value) => {
			board.playbackRate = value
		},
		{ immediate: true },
	)

	const activate = async () => {
		activation.abort()
		console.log("activate")

		board.active = true
		activated.value = true
	}

	globalThis.addEventListener("pointerdown", activate, { signal: activation.signal })
	globalThis.addEventListener("keydown", activate, { signal: activation.signal })
	canPlay().then((allowed) => {
		activated.value = false
		if (allowed) activate()
	})

	socket.on("setEdge", (value) => {
		if (globalMode.value) edgingMode.value = value
	})

	socket.on("setPlaybackRate", (value) => {
		if (globalMode.value) playbackRate.value = value
	})

	socket.on("disconnect", () => {
		globalMode.value = false

		socket.on("connect", () => {
			location.reload()
		})
	})
})

const setEdgeUI = (value: boolean) => {
	if (globalMode.value) socket.emit("setEdge", value)
	edgingMode.value = value
}

const playbackRateThrottled = refThrottled(playbackRate, 100)
watch(playbackRateThrottled, (value) => {
	if (globalMode.value) socket.emit("setPlaybackRate", value)
})

const onSoundDown = (key: string, event: PointerEvent) => {
	const stop = board.playSound(key)
	event.target?.addEventListener("pointerup", stop, { once: true })
}

onUnmounted(() => {
	board.deactivate()
})
</script>

<template>
	<main>
		<div v-if="!activated" class="activation-overlay">
			<span>click to activate</span>
		</div>

		<div v-show="activated" class="board">
			<div class="controls slider">
				<RadixSlider v-model="playbackRate" />
			</div>
			<div class="controls">
				<div class="control">
					<RadixSwitch v-model="globalMode" label-id="global" />
					<label for="global">global mode</label>
				</div>

				<div class="control">
					<RadixSwitch
						v-model="edgingMode"
						label-id="edging"
						@update:model-value="setEdgeUI"
					/>
					<label for="edging">edging mode</label>
				</div>
			</div>
			<ul id="button-list">
				<li
					v-for="[key, name] in sounds"
					:key="name"
					@pointerdown.prevent="onSoundDown(key, $event)"
				>
					<span class="key">{{ key }}</span>
					<span class="name">{{ name.replace(".mp3", "") }}</span>
				</li>
			</ul>
		</div>
	</main>
</template>

<style scoped lang="scss">
main {
	width: 90%;
	max-width: 1000px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	margin: auto;
	padding: 2rem 0;
}

.activation-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: hsl(0, 77%, 44%);
	display: flex;
	justify-content: center;
	align-items: center;

	span {
		color: white;
		font-size: 2rem;
	}
}

label,
ul {
	user-select: none;
	-webkit-user-select: none;
}

.controls {
	display: flex;
	justify-content: center;
	gap: 2em;

	&.slider {
		width: min(100%, 700px);
	}

	.control {
		display: flex;
		align-items: center;
		gap: 0.5em;
		line-height: 1;
	}
}

.board {
	width: 90%;
	max-width: 1000px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1em;
}

ul {
	list-style-type: none;
	margin: 0;
	padding: 0;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
	max-width: 100%;
	width: 100%;

	li {
		font-size: 1.25em;
		margin: 0.5em 0;
		display: flex;
		flex-direction: column;
		align-items: center;

		span.key {
			font-size: 2em;
			font-weight: 600;
		}

		span.name {
			opacity: 0.5;
			font-size: 0.9em;
		}
	}
}
</style>
