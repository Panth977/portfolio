<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	export let texts: string[] = ['thinking', 'designing', 'building'];
	export let interval = 3000;

	let currentIndex = 0;
	let animating = false;
	let rotatorElement: HTMLElement;
	let measuringElement: HTMLElement;
	let currentWidth = 0;
	let textWidths: number[] = [];

	onMount(() => {
		// Measure all text widths
		measureTextWidths();

		// Set initial width
		currentWidth = textWidths[0] || 0;

		const timer = setInterval(() => {
			const nextIndex = (currentIndex + 1) % texts.length;

			// Start width transition
			currentWidth = textWidths[nextIndex] || 0;

			// Start text animation after a small delay
			setTimeout(() => {
				currentIndex = nextIndex;
				animating = true;
				setTimeout(() => {
					animating = false;
				}, 600);
			}, 100);
		}, interval);

		onDestroy(() => {
			clearInterval(timer);
		});
	});

	function measureTextWidths() {
		if (!measuringElement) return;

		textWidths = texts.map((text) => {
			measuringElement.textContent = text;
			return measuringElement.offsetWidth;
		});
	}

	$: previousText = currentIndex === 0 ? texts[texts.length - 1] : texts[currentIndex - 1];
	$: currentText = texts[currentIndex];
</script>

<!-- Hidden element for measuring text widths -->
<span bind:this={measuringElement} class="measuring-text" aria-hidden="true">
	{texts[0]}
</span>

<span
	bind:this={rotatorElement}
	class="rotator transition-all duration-300 ease-out"
	style="width: {currentWidth}px"
>
	{#if animating}
		<span class="word">
			{#each previousText as char, i (i)}
				<span class="prev-letter" style="animation-delay: {(previousText.length - 1 - i) * 40}ms">
					{char}
				</span>
			{/each}
		</span>
	{:else}
		<span class="word">
			{#each currentText as char, i (i)}
				<span class="letter" style="animation-delay: {(currentText.length - 1 - i) * 50}ms">
					{char}
				</span>
			{/each}
		</span>
	{/if}
</span>

<style>
	.measuring-text {
		position: absolute;
		visibility: hidden;
		white-space: nowrap;
		font-size: 3rem;
		font-weight: 700;
		pointer-events: none;
		z-index: -1;
	}

	.rotator {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
		font-weight: 700;
		height: 60px;
		overflow: hidden;
		transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.word {
		position: absolute;
		display: flex;
		white-space: nowrap;
		left: 50%;
		transform: translateX(-50%);
	}

	@keyframes slideIn {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0%);
			opacity: 1;
		}
	}

	@keyframes slideOut {
		from {
			transform: translateY(0%);
			opacity: 1;
		}
		to {
			transform: translateY(-100%);
			opacity: 1;
		}
	}

	.letter {
		display: inline-block;
		opacity: 0;
		transform: translateY(100%);
		animation: slideIn 600ms cubic-bezier(0.2, 1.2, 0.3, 1) forwards;
	}

	.prev-letter {
		display: inline-block;
		opacity: 1;
		transform: translateY(0%);
		animation: slideOut 400ms ease-in forwards;
	}
</style>
