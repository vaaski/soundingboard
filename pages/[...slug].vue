<script setup lang="ts">
const sounds = Soundboard.sounds
const activated = ref(true)
const globalMode = ref(true)
const edgingMode = ref(false)

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
		edgingMode.value = value
	})

	socket.on("disconnect", () => {
		globalMode.value = false

		socket.on("connect", () => {
			location.reload()
		})
	})
})

const setEdgeUI = (value: boolean) => {
	socket.emit("setEdge", value)
	edgingMode.value = value
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
				<li v-for="[key, name] in sounds" :key="name">
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
	gap: 1em;
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
