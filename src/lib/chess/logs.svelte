<script lang="ts">
	import { XPiece } from './board';
	import type { ChesXplorePiece, Log } from './chess';
	import { Position, type Col, type Player, type Rank, type Row } from './const';

	export let logs: Log[];
	function previewRank(player: Player, rank: Rank) {
		return `<img src="chess/pieces/${player}${rank}.png" style="display: inline; height: 20px" />`;
	}
	function previewPiece(p: ChesXplorePiece) {
		return `<img src="chess/pieces/${p[0]}${p[1]}.png" style="display: inline; height: 20px" />${p[2].toLowerCase()}${p[3]}`;
	}
	function previewLoc(p: [Col, Row]) {
		return `${p[0].toLowerCase()}${p[1]}`;
	}
</script>

<div
	style="background-color: gray; color: black; padding-top: 10px; height: 100%; overflow-x: auto; padding: 10px"
>
	<h3>LOGS</h3>
	{#if !logs.length}
		<div class="font-thin italic underline">...Complete Setup First...</div>
	{/if}
	{#each [...logs].reverse() as log, i}
		<div style="border-bottom: 1px solid black" class="flex">
			<div class="font-mono text-xs">
				{logs.length - i})
			</div>
			<div>
				{#if log.type === 'setup'}
					SETUP: {@html log.piece
						.filter((x) => x[3] === Position.r8)
						.sort((x, y) => XPiece.colIndexOf(x[2]) - XPiece.colIndexOf(y[2]))
						.map((x) => previewRank(x[0], x[1]))
						.join('')}
				{:else if log.type === 'move'}
					MOVE: {@html previewPiece(log.piece)} → {previewLoc(log.to)}
				{:else if log.type === 'upgrade'}
					MOVE: ⚡️ {@html previewPiece(log.piece)} → {@html previewPiece(log.upgradeTo)}
				{:else if log.type === 'spawning'}
					SPAWNING: 🎊 {@html previewPiece(log.piece)} [-💲{log.cost.toFixed(1)}]
				{:else if log.type === 'block-spawn'}
					SPAWN BLOCK: 💀 {@html previewPiece(log.piece)} → 🚫 {@html previewPiece(
						log.spawnBlocked
					)}
				{:else if log.type === 'move-attack'}
					ATTACK:
					{#if log.selfKilled}💀{:else if log.piece[4].killed === 2}‼️{:else}❗️{/if}
					{@html previewPiece(log.piece)} → ({@html previewPiece(log.targetKilled)})
					{#if log.blasticKilled.length}
						[💥 {@html log.blasticKilled.map(previewPiece).join(' ')}]
					{/if}
					{#if log.rewardCoins}
						[+💲{log.rewardCoins}]
					{/if}
				{:else}
					⚠️ UNKNOWN ⚠️
				{/if}
			</div>
		</div>
	{/each}
</div>
