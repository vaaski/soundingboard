<script setup lang="ts">
import type { SliderRoot } from "radix-vue"
import { ref } from "vue"

const props = defineProps<{
	modelValue: number
}>()

const emit = defineEmits<{
	(event: "update:modelValue", value: number): void
}>()

const sliderValue = ref<[number]>([1])

watch(props, () => {
	sliderValue.value = [props.modelValue]
})

watch(sliderValue, () => {
	emit("update:modelValue", sliderValue.value[0])
})

const reset = () => {
	sliderValue.value = [1]
}

const sliderRoot = ref()
let lastClick = 0
const pointerdownAbort = new AbortController()
onMounted(() => {
	if (sliderRoot.value?.$el instanceof HTMLElement === false) {
		throw new TypeError("slider root element not found")
	}

	sliderRoot.value.$el.addEventListener(
		"pointerdown",
		(event: PointerEvent) => {
			if (event.timeStamp - lastClick < 250) {
				reset()
			}

			lastClick = event.timeStamp
		},
		{
			signal: pointerdownAbort.signal,
		},
	)
})

onUnmounted(() => {
	pointerdownAbort.abort()
})
</script>

<template>
	<SliderRoot
		ref="sliderRoot"
		v-model="sliderValue"
		class="slider-root"
		:max="2"
		:step="0.01"
	>
		<SliderTrack class="slider-track">
			<!-- <SliderRange class="slider-range" /> -->
		</SliderTrack>
		<SliderThumb class="slider-thumb" aria-label="Volume" />
	</SliderRoot>
</template>

<style lang="scss">
.wrapper {
	width: 100%;
	height: 100%;
}

.slider-root {
	position: relative;
	display: flex;
	align-items: center;
	user-select: none;
	touch-action: none;
	width: 100%;
	height: 20px;
}

.slider-track {
	background-color: hsl(0, 0%, 50%);
	position: relative;
	flex-grow: 1;
	border-radius: 9999px;
	height: 3px;
}

// .slider-range {
// 	position: absolute;
// 	background-color: white;
// 	border-radius: 9999px;
// 	height: 3px;
// }

.slider-thumb {
	display: block;
	width: 4px;
	height: 12px;
	background-color: hsl(0, 0%, 50%);
	border-radius: 10px;
	transition: 100ms;

	// &:hover {
	// 	background-color: hsl(0, 0%, 75%);
	// }

	&:focus {
		outline: none;
		background-color: hsl(0, 0%, 100%);
		box-shadow: 0 0 0 2px hsl(0, 0%, 50%);
	}

	&:active {
		transition: 0ms;
	}
}
</style>
