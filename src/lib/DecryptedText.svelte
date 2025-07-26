<script lang="ts" context="module">
	export interface DecryptedTextProps {
		text: string;
		speed?: number;
		maxIterations?: number;
		sequential?: boolean;
		revealDirection?: 'start' | 'end' | 'center';
		useOriginalCharsOnly?: boolean;
		characters?: string;
		className?: string;
		encryptedClassName?: string;
		parentClassName?: string;
		animateOn?: 'view' | 'hover';
	}
</script>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';

	export let text = '';
	export let speed = 50;
	export let maxIterations = 10;
	export let sequential = false;
	export let revealDirection: 'start' | 'end' | 'center' = 'start';
	export let useOriginalCharsOnly = false;
	export let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';
	export let className = '';
	export let encryptedClassName = '';
	export let parentClassName = '';
	export let animateOn: 'view' | 'hover' = 'hover';

	let displayText = text;
	let isHovering = false;
	let isScrambling = false;
	let revealedIndices = new Set<number>();
	let hasAnimated = false;
	let interval: ReturnType<typeof setInterval> | undefined;
	let containerRef: HTMLSpanElement;

	function getNextIndex(revealedSet: Set<number>): number {
		const len = text.length;
		switch (revealDirection) {
			case 'start':
				return revealedSet.size;
			case 'end':
				return len - 1 - revealedSet.size;
			case 'center': {
				const mid = Math.floor(len / 2);
				const offset = Math.floor(revealedSet.size / 2);
				const idx = revealedSet.size % 2 === 0 ? mid + offset : mid - offset - 1;
				if (idx >= 0 && idx < len && !revealedSet.has(idx)) return idx;
				for (let i = 0; i < len; i++) if (!revealedSet.has(i)) return i;
				return 0;
			}
			default:
				return revealedSet.size;
		}
	}

	function shuffle(originalText: string, currentRevealed: Set<number>): string {
		const availableChars = useOriginalCharsOnly
			? Array.from(new Set(text.split(''))).filter((c) => c !== ' ')
			: characters.split('');

		if (useOriginalCharsOnly) {
			const pos = originalText.split('').map((char, i) => ({
				char,
				isSpace: char === ' ',
				index: i,
				isRevealed: currentRevealed.has(i)
			}));
			const toShuffle = pos.filter((p) => !p.isSpace && !p.isRevealed).map((p) => p.char);
			for (let i = toShuffle.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[toShuffle[i], toShuffle[j]] = [toShuffle[j], toShuffle[i]];
			}
			let ci = 0;
			return pos
				.map((p) => (p.isSpace ? ' ' : p.isRevealed ? originalText[p.index] : toShuffle[ci++]))
				.join('');
		} else {
			return originalText
				.split('')
				.map((c, i) => {
					if (c === ' ') return ' ';
					if (currentRevealed.has(i)) return originalText[i];
					return availableChars[Math.floor(Math.random() * availableChars.length)];
				})
				.join('');
		}
	}

	function startScrambling() {
		isScrambling = true;
		let iteration = 0;

		interval = setInterval(() => {
			if (sequential) {
				if (revealedIndices.size < text.length) {
					const idx = getNextIndex(revealedIndices);
					revealedIndices = new Set(revealedIndices);
					revealedIndices.add(idx);
					displayText = shuffle(text, revealedIndices);
				} else {
					clearInterval(interval);
					isScrambling = false;
				}
			} else {
				displayText = shuffle(text, revealedIndices);
				iteration++;
				if (iteration >= maxIterations) {
					clearInterval(interval);
					isScrambling = false;
					displayText = text;
				}
			}
		}, speed);
	}

	$: if (isHovering) {
		startScrambling();
	} else {
		clearInterval(interval);
		displayText = text;
		revealedIndices = new Set();
		isScrambling = false;
	}

	onMount(() => {
		if (animateOn === 'view') {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting && !hasAnimated) {
							isHovering = true;
							hasAnimated = true;
						}
					});
				},
				{ threshold: 0.1 }
			);
			observer.observe(containerRef);
			onDestroy(() => observer.unobserve(containerRef));
		}
	});
</script>

<span
	bind:this={containerRef}
	role="presentation"
	class="inline-block whitespace-pre-wrap {parentClassName} text-white"
	onmouseenter={() => animateOn === 'hover' && (isHovering = true)}
	onmouseleave={() => animateOn === 'hover' && (isHovering = false)}
>
	<span class="sr-only">{displayText}</span>
	<span aria-hidden="true">
		{#each displayText.split('') as char, index}
			<span
				class={revealedIndices.has(index) || !isScrambling || !isHovering
					? className
					: encryptedClassName}
				transition:fade={{ duration: 200 }}
			>
				{char}
			</span>
		{/each}
	</span>
</span>
