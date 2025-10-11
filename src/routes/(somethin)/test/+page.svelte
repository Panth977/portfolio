<script lang="ts">
	import ChessPlayerState from '$lib/chess/state.svelte';
	import ChessLogs from '$lib/chess/logs.svelte';
	import { ChesXplore } from '$lib/chess/chess';
	import { onDestroy, onMount } from 'svelte';
	import { Pieces } from '$lib/chess/const';

	let mainDiv: HTMLDivElement;
	let parentDiv: HTMLDivElement;
	let rootDiv: HTMLDivElement;
	let chess: ChesXplore;
	const boardSize = 800;
	let widgetScaleFactor = 1;
	function setupChess() {
		if (chess) {
			if (!confirm('Are you shure you would like to reset the existing game?')) return;
			chess = ChesXplore.empty(rootDiv, boardSize);
		} else {
			chess = ChesXplore.load('default', rootDiv, boardSize);
		}
		chess.setScalingFactor(widgetScaleFactor);
	}

	onMount(() => {
		setupChess();
		const t = setInterval(() => ChesXplore.save('default', chess), 1000);
		onDestroy(() => {
			clearInterval(t);
		});
	});
	$: logs = chess?.readableLogs();
	$: state = chess?.readableState();
</script>

<div class="mx-auto w-min">
	<div bind:this={mainDiv} class="border-white-500 flex border-1">
		<div>
			<div style="height: 55px;">
				{#if chess}
					<ChessPlayerState state={$state} player={Pieces.pBlack} />
				{/if}
			</div>
			<div bind:this={parentDiv} class="border-1 border-gray-500">
				<div bind:this={rootDiv}></div>
			</div>
			<div style="height: 55px;">
				{#if chess}
					<ChessPlayerState state={$state} player={Pieces.pWhite} />
				{/if}
			</div>
		</div>
		<div class="w-full max-w-[500px] min-w-[300px]">
			{#if chess}
				<ChessLogs logs={$logs} />
			{/if}
		</div>
	</div>
</div>

<button onclick={setupChess} class="m-10 border-1 border-s-stone-500 text-lg"> Reset </button>
