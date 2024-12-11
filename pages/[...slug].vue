<script setup lang="ts">
const sounds = Soundboard.sounds
const activated = ref(false)

onMounted(() => {
	const board = new Soundboard()
	const activation = new AbortController()

	const activate = async () => {
		activation.abort()
		console.log("activate")

		board.active = true
		activated.value = true
	}

	globalThis.addEventListener("pointerdown", activate, { signal: activation.signal })
	globalThis.addEventListener("keydown", activate, { signal: activation.signal })
})
</script>

<template>
	<main>
		<div v-if="!activated" class="activation-overlay">
			<span>click to activate</span>
		</div>
		<ul v-show="activated" id="button-list">
			<li v-for="[key, name] in sounds" :key="name">
				{{ `${key} - ${name.replace(".mp3", "")}` }}
			</li>
		</ul>
	</main>
</template>

<style scoped lang="scss">
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
		font-family: sans-serif;
	}
}

label,
ul {
	font-family: monospace;
	user-select: none;
}

ul {
	list-style-type: none;
	margin: 0;
	padding: 0;
}

ul > li {
	font-size: 1.25em;
	margin: 0.5em 0;
	-webkit-user-select: none;
}
</style>
