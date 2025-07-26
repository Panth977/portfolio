<script lang="ts">
	export let className: string = '';
	export let colors: string[] = ['#FF1493', '#FF4500', '#FFA500', '#FF6347', '#FF1493']; // ['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa'];
	export let animationSpeed: number = 8;
	export let showBorder: boolean = false;

	$: gradientStyle = {
		backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
		animationDuration: `${animationSpeed}s`
	};
</script>

<span class="animated-gradient-text {className} ">
	{#if showBorder}
		<span
			class="gradient-overlay"
			style="background-image: {gradientStyle.backgroundImage}; animation-duration: {gradientStyle.animationDuration}"
		></span>
	{/if}
	<span
		class="text-content"
		style="background-image: {gradientStyle.backgroundImage}; animation-duration: {gradientStyle.animationDuration}"
	>
		<slot />
	</span>
</span>

<style>
	.animated-gradient-text {
		margin: 0 auto;
		max-width: fit-content;
		font-weight: 500;
		backdrop-filter: blur(10px);
		transition: box-shadow 0.5s ease-out;
	}

	.gradient-overlay {
		background-size: 300% 100%;
		animation: gradient linear infinite;
		border-radius: inherit;
		z-index: 0;
		pointer-events: none;
	}

	@keyframes gradient {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	.text-content {
		display: inline-block;
		/* position: relative; */
		z-index: 2;
		background-size: 300% 100%;
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		animation: gradient linear infinite;
	}
</style>
