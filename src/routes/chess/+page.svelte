<script lang="ts">
	import { ChesXplore } from '$lib/chess';
	import { onMount } from 'svelte';

	let canvasDiv: HTMLDivElement;
	let canvasDivParent: HTMLDivElement;
	let chess: ChesXplore;
	const boardSize = 800;
	const logsHeightSize = 800;
	const logsWidthSize = 300;
	const widgetWidthSize = boardSize + logsWidthSize;
	const widgetHeightSize = Math.max(boardSize, logsHeightSize);
	let widgetScaleFactor = 1;
	function setupChess() {
		if (chess && !confirm('Are you shure you would like to reset the existing game?')) return;
		canvasDiv.innerHTML = ``;
		const rootDiv = document.createElement('div');
		const logsDiv = document.createElement('div');
		canvasDiv.append(rootDiv, logsDiv);
		chess = new ChesXplore(rootDiv, boardSize);
		chess.setScalingFactor(widgetScaleFactor);
		chess.mountLogs(logsDiv, logsHeightSize, logsWidthSize);
	}
	function Size() {
		if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
			// Native fullscreen || Safari prefix
			return {
				currentWidth: screen.width * 0.95,
				currentHeight: screen.height * 0.95,
				widgetWidthSize,
				widgetHeightSize,
				get widgetScaleFactor() {
					return Math.min(
						this.currentHeight / this.widgetHeightSize,
						this.currentWidth / this.widgetWidthSize
					);
				}
			};
		} else {
			// Not in fullscreen
			return {
				currentWidth: window.innerWidth,
				currentHeight: window.innerHeight,
				widgetWidthSize,
				widgetHeightSize,
				get widgetScaleFactor() {
					return Math.min(
						window.innerHeight >= widgetHeightSize ? 1 : window.innerHeight / widgetHeightSize,
						window.innerWidth >= widgetWidthSize ? 1 : window.innerWidth / widgetWidthSize
					);
				}
			};
		}
	}
	function handleResize() {
		const { currentWidth, currentHeight, widgetHeightSize, widgetWidthSize, widgetScaleFactor } =
			Size();
		canvasDiv.style.transformOrigin = 'top left';
		canvasDiv.style.transform = `scale(${widgetScaleFactor})`;
		canvasDiv.style.width = `${widgetWidthSize}px`;
		canvasDiv.style.height = `${widgetHeightSize}px`;
		const scaledW = Math.round(widgetWidthSize * widgetScaleFactor);
		const scaledH = Math.round(widgetHeightSize * widgetScaleFactor);
		canvasDivParent.style.width = `${scaledW}px`;
		canvasDivParent.style.height = `${scaledH}px`;
		canvasDivParent.style.overflow = 'hidden';
		chess?.setScalingFactor(widgetScaleFactor);
	}
	onMount(() => {
		document.addEventListener('fullscreenchange', onFsChange);
		document.addEventListener('webkitfullscreenchange', onFsChange);
		handleResize();
		setupChess();
		window.addEventListener('resize', handleResize);
		chess.fakerun();
	});
	// fullscreen.ts
	async function enterFullscreen(el: HTMLElement) {
		const req =
			el.requestFullscreen ||
			// @ts-ignore - vendor prefixes
			el.webkitRequestFullscreen ||
			// Older Safari
			(el as any).webkitEnterFullscreen;
		if (req) {
			try {
				await req.call(el);
				document.documentElement.classList.add('fs-active');
				// Try to lock orientation for a better gaming experience (best-effort)
				// This can be ignored/rejected on some platforms.
				// @ts-ignore
				if (screen.orientation?.lock) screen.orientation.lock('landscape').catch(() => {});
				return;
			} catch {
				// fall through to CSS fallback
			}
		}

		// Fallback: simulate fullscreen by pinning element to viewport
		el.classList.add('fs-fallback');
		document.documentElement.classList.add('fs-active');
	}
	async function exitFullscreen(el?: HTMLElement) {
		const isNative =
			document.fullscreenElement ||
			// @ts-ignore
			document.webkitFullscreenElement;

		if (isNative) {
			const exit =
				document.exitFullscreen ||
				// @ts-ignore
				document.webkitExitFullscreen;
			try {
				await exit.call(document);
			} finally {
				document.documentElement.classList.remove('fs-active');
			}
		} else {
			// Fallback off
			el?.classList.remove('fs-fallback');
			document.documentElement.classList.remove('fs-active');
		}
	}
	async function toggleFullscreen(el: HTMLElement) {
		const isNative =
			document.fullscreenElement === el ||
			// @ts-ignore
			document.webkitFullscreenElement === el;

		const isFallback = el.classList.contains('fs-fallback');

		if (isNative || isFallback) return exitFullscreen(el);
		return enterFullscreen(el);
	}
	function onFsChange() {
		if (
			!document.fullscreenElement &&
			// @ts-ignore
			!document.webkitFullscreenElement
		) {
			document.documentElement.classList.remove('fs-active');
		}
	}
	function goFullscreen() {
		if (!chess || !confirm('Enable fullscreen?')) return;
		toggleFullscreen(canvasDivParent);
		handleResize();
	}
</script>

<div class="mx-auto max-w-4xl p-6">
	<h1 class="text-center text-3xl font-bold md:text-4xl">🏰 Explosive Chess</h1>
</div>
<div bind:this={canvasDivParent} class="mx-auto my-2 border-1 border-gray-500">
	<div bind:this={canvasDiv} class="flex"></div>
</div>
<div class="mx-auto max-w-4xl p-6">
	<button
		class="border-1 border-r-4 border-s-slate-950 text-center text-3xl font-bold md:text-4xl"
		onclick={setupChess}
	>
		Reset?
	</button>
	<button
		class="border-1 border-r-4 border-s-slate-950 text-center text-3xl font-bold md:text-4xl"
		onclick={goFullscreen}
	>
		Full Screen Mode?
	</button>
</div>
<div class="mx-auto max-w-4xl p-6">
	<h1 class="mb-6 text-center text-3xl font-bold md:text-4xl">Gameplay Rules</h1>
	<section class="mb-8">
		<h2 class="mb-2 text-xl font-semibold text-blue-700">Setup</h2>
		<ul class="list-inside list-disc space-y-1">
			<li>Black chooses the starting positions of all ranked pieces (everything except pawns).</li>
			<li>White automatically mirrors Black’s placement.</li>
			<li>Pawns are placed normally.</li>
		</ul>
	</section>

	<section class="mb-8">
		<h2 class="mb-2 text-xl font-semibold text-blue-700">Turns & Movement</h2>
		<ul class="list-inside list-disc space-y-1">
			<li>White moves first, as in classic chess.</li>
			<li>All pieces move as in standard chess — but with special powers!</li>
		</ul>
	</section>

	<section class="mb-8">
		<h2 class="mb-2 text-xl font-semibold text-blue-700">Piece Powers</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="rounded-xl bg-slate-900 p-4 shadow">
				<p>
					<strong>
						<img src="chess/pieces/WR.png" alt="WhiteRook" class="inline h-[1rem]" />
						Rook &
						<img src="chess/pieces/WB.png" alt="WhiteBishop" class="inline h-[1rem]" />
						Bishop:
					</strong> On capture, they explode along diagonals (1 tile range) and then die.
				</p>
			</div>
			<div class="rounded-xl bg-slate-900 p-4 shadow">
				<p>
					<strong>
						<img src="chess/pieces/WQ.png" alt="WhiteQueen" class="inline h-[1rem]" />
						Queen:
					</strong> On capture, she explodes in all directions except her movement direction (1 tile
					range), then dies.
				</p>
			</div>
			<div class="rounded-xl bg-slate-900 p-4 shadow">
				<p>
					<strong>
						<img src="chess/pieces/WK.png" alt="WhiteKing" class="inline h-[1rem]" />
						King:
					</strong> Cannot capture. It’s illegal for the King to kill. also has a Strong shield that
					can withstand any blasts.
				</p>
			</div>
			<div class="rounded-xl bg-slate-900 p-4 shadow">
				<p>
					<strong>
						<img src="chess/pieces/WN.png" alt="WhiteKnight" class="inline h-[1rem]" />
						Knight:
					</strong> Dies automatically after its 3rd kill.
				</p>
			</div>
			<div class="rounded-xl bg-slate-900 p-4 shadow">
				<p>
					<strong>
						<img src="chess/pieces/WP.png" alt="WhitePawn" class="inline h-[1rem]" />
						Pawn:
					</strong> Immune to explosions. On capture, dies but grants bonus coins.
				</p>
			</div>
		</div>
		<p class="mt-2 text-gray-600 italic">
			💥 Explosions only affect enemy ranked pieces. Pawns & King for all are explosion safe.
		</p>
	</section>

	<section class="mb-8">
		<h2 class="mb-2 text-xl font-semibold text-blue-700">Wallet & Recruitment</h2>
		<ul class="list-inside list-disc space-y-1">
			<li>The King holds the treasury (“wallet”) and can recruit new pieces.</li>
			<li>Maximum of <strong>10 coins</strong> in the wallet.</li>
			<li>Spawning counts as a move and must be on an empty tile.</li>
			<li>Newly spawned pieces start as <strong>ghosts</strong> (passable until the next turn).</li>
			<li>If a ghost overlaps with another piece when solidifying, both die.</li>
			<li>Moving onto a ghost counts as a move, but the resulting double-death does not.</li>
			<li>Placing the King on a spawn tile is illegal: both King & pawn die. No coins rewarded.</li>
		</ul>
		<p class="mt-2 font-medium">💰 Each turn, both kings gain <strong>0.5 coins</strong>.</p>
	</section>

	<section class="mb-8">
		<h2 class="mb-2 text-xl font-semibold text-blue-700">Costs & Rewards</h2>
		<div class="overflow-x-auto">
			<table class="min-w-full overflow-hidden rounded-lg border border-gray-300">
				<thead class="bg-gray-800 text-white">
					<tr>
						<th class="px-4 py-2 text-left">Piece</th>
						<th class="px-4 py-2">Cost to Recruit</th>
						<th class="px-4 py-2">Placement Row Limit</th>
						<th class="px-4 py-2">Pawn Kill Reward</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-slate-900">
					<tr>
						<td class="px-4 py-2 font-medium">
							<img src="chess/pieces/WQ.png" alt="WhiteQueen" class="inline h-[1rem]" />
							Queen
						</td>
						<td class="px-4 py-2 text-center">7 coins</td>
						<td class="px-4 py-2 text-center">Base row only</td>
						<td class="px-4 py-2 text-center">+3 coins</td>
					</tr>
					<tr>
						<td class="px-4 py-2 font-medium">
							<img src="chess/pieces/WR.png" alt="WhiteRook" class="inline h-[1rem]" />
							Rook
						</td>
						<td class="px-4 py-2 text-center">5 coins</td>
						<td class="px-4 py-2 text-center">Up to 2nd row</td>
						<td class="px-4 py-2 text-center">+2 coins</td>
					</tr>
					<tr>
						<td class="px-4 py-2 font-medium">
							<img src="chess/pieces/WB.png" alt="WhiteBishop" class="inline h-[1rem]" />
							Bishop
						</td>
						<td class="px-4 py-2 text-center">5 coins</td>
						<td class="px-4 py-2 text-center">Up to 2nd row</td>
						<td class="px-4 py-2 text-center">+2 coins</td>
					</tr>
					<tr>
						<td class="px-4 py-2 font-medium">
							<img src="chess/pieces/WN.png" alt="WhiteKnight" class="inline h-[1rem]" />
							Knight
						</td>
						<td class="px-4 py-2 text-center">4.5 coins</td>
						<td class="px-4 py-2 text-center">Up to 3rd row</td>
						<td class="px-4 py-2 text-center">+2.5 coins</td>
					</tr>
					<tr>
						<td class="px-4 py-2 font-medium">
							<img src="chess/pieces/WP.png" alt="WhitePawn" class="inline h-[1rem]" />
							Pawn
						</td>
						<td class="px-4 py-2 text-center">3 coins</td>
						<td class="px-4 py-2 text-center">Up to 3rd row</td>
						<td class="px-4 py-2 text-center">+1.5 coins</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="mb-8">
		<h2 class="mb-2 text-xl font-semibold text-blue-700">Victory</h2>
		<p class="rounded-lg bg-yellow-100 p-4 font-medium text-gray-900 shadow">
			There are <strong>no draws</strong> in this game. Keep playing, keep recruiting, keep exploding
			— until one side finally wins!
		</p>
	</section>
</div>

<style>
	/* Lock page scroll while in fullscreen (native or fallback) */
	:global(.fs-active, .fs-active body) {
		overflow: hidden !important;
	}

	/* Native fullscreen styles for your game container */
	:fullscreen {
		background: #000; /* optional: letterbox background */
	}

	/* Fallback "fullscreen" when the API isn't available/allowed */
	:global(.fs-fallback) {
		position: fixed !important;
		inset: 0 !important;
		width: 100vw !important;
		height: 100vh !important;
		background: #000 !important;
		z-index: 999999 !important;
	}
</style>
