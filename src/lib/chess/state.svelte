<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Pieces, type Player } from './const';
	import type { State } from './chess';
	export let state: State;
	export let player: Player;
	let now = Date.now();
	onMount(() => {
		const t = setInterval(() => (now = Date.now()), 1000);
		onDestroy(() => {
			clearInterval(t);
		});
	});
	$: time =
		state.win || state.turn !== player
			? Math.floor(state.ts[player] / 1000)
			: state.setupTs
				? Math.floor((state.ts[player] + Math.max(0, now - state.timed)) / 1000)
				: 0;
	$: formated = `${('' + Math.floor(time / 60)).padStart(2, '0')}:${('' + (time % 60)).padStart(2, '0')}`;

	$: setupTime = state.setupTs
		? Math.floor(state.setupTs / 1000)
		: Math.floor(Math.max(0, now - state.timed) / 1000);
	$: setupFormated = `${('' + Math.floor(setupTime / 60)).padStart(2, '0')}:${('' + (setupTime % 60)).padStart(2, '0')}`;
</script>

<div
	class="font-mono"
	style="font-size: 20px; background-color: black; color: white; padding: 5px;"
>
	<div>
		<span class="bg-stone-700">{formated}</span>
		{#if player === Pieces.pWhite}
			WHITE
		{:else}
			BLACK
			<span class="bg-stone-700" style="font-size: 15px;">{setupFormated}</span>
		{/if}
		:
		<span style="color: gold"> ${state.wallet[player]} </span>
		{#if state.win}
			{#if state.win === player}
				<span style="font-size: 25px; border: 1px solid gold; padding-inline: 5px; padding: 2px;">
					👑 WIN
				</span>
			{/if}
		{:else if state.turn === player}
			<span style="background-color: deeppink; padding-inline: 5px"> TURN </span>
		{/if}
	</div>
	<div style="height: 5px; width: 100%; min-width: 200px; background-color: gray">
		<div
			style="height: 100%; width: {(state.wallet[player] / 10) * 100}%; background-color: gold"
		></div>
	</div>
</div>
