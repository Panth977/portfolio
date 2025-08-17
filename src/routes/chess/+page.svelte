<script lang="ts">
	import { ChesXplore } from '$lib/chess';
	import { onMount } from 'svelte';

	let canvasDiv: HTMLDivElement;
	let chess: ChesXplore;
	function setupChess() {
		if (chess && !confirm('Are you shure you would like to reset the existing game?')) return;
		canvasDiv.innerHTML = ``;
		const rootDiv = document.createElement('div');
		const logsDiv = document.createElement('div');
		canvasDiv.append(rootDiv, logsDiv);
		const isFirstTime = typeof chess === 'undefined';
		chess = new ChesXplore(rootDiv, 800);
		chess.mountLogs(logsDiv, 800, 400);
		if (isFirstTime) chess.fakerun();
	}
	onMount(setupChess);
</script>

<div class="mx-auto max-w-4xl p-6">
	<h1 class="text-center text-3xl font-bold md:text-4xl">🏰 Explosive Chess</h1>
</div>
<div
	bind:this={canvasDiv}
	style="min-width: 1200px; min-height: 800px;"
	class="m-2 mx-auto flex h-min w-min border-1 border-gray-500"
></div>
<div class="mx-auto max-w-4xl p-6">
	<button
		class="border-1 border-r-4 border-s-slate-950 text-center text-3xl font-bold md:text-4xl"
		onclick={setupChess}
	>
		Reset?
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
