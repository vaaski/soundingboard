<script setup lang="ts">
const props = defineProps<{
	labelId?: string
}>()

const model = defineModel<boolean>()
</script>

<template>
	<div class="switch">
		<SwitchRoot
			v-bind="$attrs"
			:id="props.labelId"
			v-model:checked="model"
			class="switch-root"
		>
			<SwitchThumb class="switch-thumb" />
		</SwitchRoot>
	</div>
</template>

<style scoped lang="scss">
.switch {
	display: flex;
}

:deep(button) {
	all: unset;
}

:deep(.switch-root) {
	--switch-width: 2.25rem;
	--switch-height: 1.25rem;
	--thumb-margin: 2px;

	--thumb-diameter: calc(var(--switch-height) - var(--thumb-margin) * 2);

	width: var(--switch-width);
	height: var(--switch-height);
	background-color: hsla(0, 0%, 50%, 25%);
	border-radius: 9999px;
	position: relative;
	-webkit-tap-highlight-color: transparent;

	transition:
		background-color 100ms,
		box-shadow 100ms;

	&[data-state="checked"] {
		background-color: hsl(0, 0%, 50%);
	}

	&:focus {
		box-shadow: 0 0 0 1px currentColor;
	}
}

:deep(.switch-thumb) {
	display: block;
	width: var(--thumb-diameter);
	height: var(--thumb-diameter);
	background-color: white;
	border-radius: 9999px;
	transition: transform 100ms;
	transform: translateX(var(--thumb-margin));
	will-change: transform;

	&[data-state="checked"] {
		transform: translateX(
			calc(var(--switch-width) - var(--thumb-diameter) - var(--thumb-margin))
		);
	}
}
</style>
