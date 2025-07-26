<script lang="ts">
	import { Motion, useMotionValue, useTransform } from 'svelte-motion';

	// Type definitions
	interface CardData {
		id: number;
		img: string;
	}

	interface CardDimensions {
		width: number;
		height: number;
	}

	interface AnimationConfig {
		stiffness: number;
		damping: number;
	}

	interface DragInfo {
		offset: {
			x: number;
			y: number;
		};
	}

	// Props
	export let randomRotation: boolean = false;
	export let sensitivity: number = 200;
	export let cardDimensions: CardDimensions = { width: 208, height: 208 };
	export let sendToBackOnClick: boolean = false;
	export let cardsData: CardData[] = [];
	export let animationConfig: AnimationConfig = { stiffness: 260, damping: 20 };

	// Initialize cards data
	let cards: CardData[] = cardsData.length
		? cardsData
		: [
				{
					id: 1,
					img: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format'
				},
				{
					id: 2,
					img: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format'
				},
				{
					id: 3,
					img: 'https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format'
				},
				{
					id: 4,
					img: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format'
				}
			];

	// Function to disable text selection
	function disableTextSelection(): void {
		if (document.body) {
			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';
			document.body.style.cursor = 'grabbing';
		}
	}

	// Function to enable text selection
	function enableTextSelection(): void {
		if (document.body) {
			document.body.style.userSelect = '';
			document.body.style.webkitUserSelect = '';
			document.body.style.cursor = 'default';
		}
	}

	function sendToBack(id: number): void {
		const newCards = [...cards];
		const index = newCards.findIndex((card) => card.id === id);
		const [card] = newCards.splice(index, 1);
		newCards.unshift(card);
		cards = newCards;
	}

	function createCardRotate(cardId: number) {
		const x = useMotionValue(0);
		const y = useMotionValue(0);
		const rotateX = useTransform(y, [-100, 100], [60, -60]);
		const rotateY = useTransform(x, [-100, 100], [-60, 60]);

		function handleDragStart(): void {
			disableTextSelection();
		}

		function handleDragEnd(event: Event, info: DragInfo): void {
			enableTextSelection();

			if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
				sendToBack(cardId);
			} else {
				x.set(0);
				y.set(0);
			}
		}

		return {
			x,
			y,
			rotateX,
			rotateY,
			handleDragStart,
			handleDragEnd
		};
	}
</script>

<div
	class="relative"
	style="width: {cardDimensions.width}px; height: {cardDimensions.height}px; perspective: 600px;"
>
	{#each cards as card, index (card.id)}
		{@const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0}
		{@const cardRotate = createCardRotate(card.id)}

		<Motion
			let:motion
			drag
			dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
			dragElastic={0.6}
			style={{
				x: cardRotate.x,
				y: cardRotate.y,
				rotateX: cardRotate.rotateX,
				rotateY: cardRotate.rotateY
			}}
			onDragStart={cardRotate.handleDragStart}
			onDragEnd={cardRotate.handleDragEnd}
		>
			<div
				role="button"
				tabindex="0"
				use:motion
				class="absolute cursor-grab select-none"
				style="cursor: grab;"
			>
				<Motion
					let:motion
					animate={{
						rotateZ: (cards.length - index - 1) * 4 + randomRotate,
						scale: 1 + index * 0.06 - cards.length * 0.06,
						transformOrigin: '90% 90%'
					}}
					initial={false}
					transition={{
						type: 'spring',
						stiffness: animationConfig.stiffness,
						damping: animationConfig.damping
					}}
				>
					<div
						use:motion
						class="overflow-hidden rounded-2xl border-4 border-white select-none"
						style="width: {cardDimensions.width}px; height: {cardDimensions.height}px;"
						on:click={() => sendToBackOnClick && sendToBack(card.id)}
						role="button"
						tabindex="0"
						on:keydown={(e: KeyboardEvent) => {
							if ((e.key === 'Enter' || e.key === ' ') && sendToBackOnClick) {
								e.preventDefault();
								sendToBack(card.id);
							}
						}}
					>
						<img
							src={card.img}
							alt="card-{card.id}"
							class="pointer-events-none h-full w-full object-cover select-none"
							draggable="false"
						/>
					</div>
				</Motion>
			</div>
		</Motion>
	{/each}
</div>

<style>
	.cursor-grab {
		cursor: grab;
	}

	.cursor-grab:active {
		cursor: grabbing;
	}

	.select-none {
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}
</style>
