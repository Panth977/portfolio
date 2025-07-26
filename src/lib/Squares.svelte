<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	type CanvasStrokeStyle = string | CanvasGradient | CanvasPattern;

	interface GridOffset {
		x: number;
		y: number;
	}

	export let direction: 'diagonal' | 'up' | 'right' | 'down' | 'left' = 'diagonal';
	export let speed: number = 0.5;
	export let borderColor: CanvasStrokeStyle = '#FFA500';
	export let squareSize: number = 40;
	export let hoverFillColor: CanvasStrokeStyle = '#111';

	let canvas: HTMLCanvasElement;
	let requestRef: number | null = null;
	let gridOffset: GridOffset = { x: 0, y: 0 };
	let hoveredSquare: GridOffset | null = null;

	let numSquaresX: number, numSquaresY: number;

	onMount(() => {
		const ctx = canvas.getContext('2d');

		const resizeCanvas = () => {
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;
			numSquaresX = Math.ceil(canvas.width / squareSize) + 1;
			numSquaresY = Math.ceil(canvas.height / squareSize) + 1;
		};

		const handleResize = () => resizeCanvas();
		window.addEventListener('resize', handleResize);
		resizeCanvas();

		const drawGrid = () => {
			if (!ctx) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const startX = Math.floor(gridOffset.x / squareSize) * squareSize;
			const startY = Math.floor(gridOffset.y / squareSize) * squareSize;

			for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
				for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
					const squareX = x - (gridOffset.x % squareSize);
					const squareY = y - (gridOffset.y % squareSize);

					if (
						hoveredSquare &&
						Math.floor((x - startX) / squareSize) === hoveredSquare.x &&
						Math.floor((y - startY) / squareSize) === hoveredSquare.y
					) {
						ctx.fillStyle = hoverFillColor;
						ctx.fillRect(squareX, squareY, squareSize, squareSize);
					}

					ctx.strokeStyle = borderColor;
					ctx.strokeRect(squareX, squareY, squareSize, squareSize);
				}
			}

			const gradient = ctx.createRadialGradient(
				canvas.width / 2,
				canvas.height / 2,
				0,
				canvas.width / 2,
				canvas.height / 2,
				Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
			);
			gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
			gradient.addColorStop(1, '#060010');

			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		};

		const updateAnimation = () => {
			const effectiveSpeed = Math.max(speed, 0.1);
			switch (direction) {
				case 'right':
					gridOffset.x = (gridOffset.x - effectiveSpeed + squareSize) % squareSize;
					break;
				case 'left':
					gridOffset.x = (gridOffset.x + effectiveSpeed + squareSize) % squareSize;
					break;
				case 'up':
					gridOffset.y = (gridOffset.y + effectiveSpeed + squareSize) % squareSize;
					break;
				case 'down':
					gridOffset.y = (gridOffset.y - effectiveSpeed + squareSize) % squareSize;
					break;
				case 'diagonal':
					gridOffset.x = (gridOffset.x - effectiveSpeed + squareSize) % squareSize;
					gridOffset.y = (gridOffset.y - effectiveSpeed + squareSize) % squareSize;
					break;
				default:
					break;
			}

			drawGrid();
			requestRef = requestAnimationFrame(updateAnimation);
		};

		const handleMouseMove = (event: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;
			const mouseY = event.clientY - rect.top;

			const startX = Math.floor(gridOffset.x / squareSize) * squareSize;
			const startY = Math.floor(gridOffset.y / squareSize) * squareSize;

			const hoveredSquareX = Math.floor((mouseX + gridOffset.x - startX) / squareSize);
			const hoveredSquareY = Math.floor((mouseY + gridOffset.y - startY) / squareSize);

			if (
				!hoveredSquare ||
				hoveredSquare.x !== hoveredSquareX ||
				hoveredSquare.y !== hoveredSquareY
			) {
				hoveredSquare = { x: hoveredSquareX, y: hoveredSquareY };
			}
		};

		const handleMouseLeave = () => {
			hoveredSquare = null;
		};

		canvas.addEventListener('mousemove', handleMouseMove);
		canvas.addEventListener('mouseleave', handleMouseLeave);
		requestRef = requestAnimationFrame(updateAnimation);

		// Cleanup function
		return () => {
			window.removeEventListener('resize', handleResize);
			if (requestRef) cancelAnimationFrame(requestRef);
			canvas.removeEventListener('mousemove', handleMouseMove);
			canvas.removeEventListener('mouseleave', handleMouseLeave);
		};
	});

	onDestroy(() => {
		if (requestRef) {
			cancelAnimationFrame(requestRef);
		}
	});

	// Reactive statement to handle prop changes
	$: if (canvas) {
		// Restart animation when props change
		if (requestRef) {
			cancelAnimationFrame(requestRef);
		}
		const updateAnimation = () => {
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			const effectiveSpeed = Math.max(speed, 0.1);
			switch (direction) {
				case 'right':
					gridOffset.x = (gridOffset.x - effectiveSpeed + squareSize) % squareSize;
					break;
				case 'left':
					gridOffset.x = (gridOffset.x + effectiveSpeed + squareSize) % squareSize;
					break;
				case 'up':
					gridOffset.y = (gridOffset.y + effectiveSpeed + squareSize) % squareSize;
					break;
				case 'down':
					gridOffset.y = (gridOffset.y - effectiveSpeed + squareSize) % squareSize;
					break;
				case 'diagonal':
					gridOffset.x = (gridOffset.x - effectiveSpeed + squareSize) % squareSize;
					gridOffset.y = (gridOffset.y - effectiveSpeed + squareSize) % squareSize;
					break;
				default:
					break;
			}

			// Redraw grid
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const startX = Math.floor(gridOffset.x / squareSize) * squareSize;
			const startY = Math.floor(gridOffset.y / squareSize) * squareSize;

			for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
				for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
					const squareX = x - (gridOffset.x % squareSize);
					const squareY = y - (gridOffset.y % squareSize);

					if (
						hoveredSquare &&
						Math.floor((x - startX) / squareSize) === hoveredSquare.x &&
						Math.floor((y - startY) / squareSize) === hoveredSquare.y
					) {
						ctx.fillStyle = hoverFillColor;
						ctx.fillRect(squareX, squareY, squareSize, squareSize);
					}

					ctx.strokeStyle = borderColor;
					ctx.strokeRect(squareX, squareY, squareSize, squareSize);
				}
			}

			const gradient = ctx.createRadialGradient(
				canvas.width / 2,
				canvas.height / 2,
				0,
				canvas.width / 2,
				canvas.height / 2,
				Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
			);
			gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
			gradient.addColorStop(1, '#060010');

			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			requestRef = requestAnimationFrame(updateAnimation);
		};

		requestRef = requestAnimationFrame(updateAnimation);
	}
</script>

<canvas bind:this={canvas} class="squares-canvas"></canvas>

<style>
	.squares-canvas {
		width: 100%;
		height: 100%;
		border: none;
		display: block;
	}
</style>
