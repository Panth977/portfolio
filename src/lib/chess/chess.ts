import { derived, get, writable } from 'svelte/store';
import { ChessBoard, XPiece } from './board';
import { Pieces, type Col, type Piece, type Player, type Rank, type Row, Position } from './const';
export type PieceMeta = {
	isFirst?: boolean;
	killed?: number;
	isSpawning?: boolean;
	movedFrom?: [number, number];
};
export type ChesXplorePiece = Piece<PieceMeta>;
export class ChesXploreXPiece extends XPiece<PieceMeta> {}
export type SetupLog = {
	type: 'setup';
	piece: ChesXplorePiece[];
	walletSnap: Record<Player, number>;
};
export type MoveLog = {
	type: 'move';
	piece: ChesXplorePiece;
	to: [Col, Row];
	walletSnap: Record<Player, number>;
};
export type UpgradeLog = {
	type: 'upgrade';
	piece: ChesXplorePiece;
	upgradeTo: ChesXplorePiece;
	walletSnap: Record<Player, number>;
};
export type MoveAttackLog = {
	type: 'move-attack';
	piece: ChesXplorePiece;
	to: [Col, Row];
	selfKilled: boolean;
	targetKilled: ChesXplorePiece;
	blasticKilled: ChesXplorePiece[];
	rewardCoins: number;
	walletSnap: Record<Player, number>;
};
export type SpawningLog = {
	type: 'spawning';
	cost: number;
	piece: ChesXplorePiece;
	walletSnap: Record<Player, number>;
};
export type SpawnBlockLog = {
	type: 'block-spawn';
	piece: ChesXplorePiece;
	spawnBlocked: ChesXplorePiece;
	walletSnap: Record<Player, number>;
};
export type Log = SetupLog | MoveLog | MoveAttackLog | UpgradeLog | SpawnBlockLog | SpawningLog;
export type State = {
	turn: Player;
	wallet: Record<Player, number>;
	timed: number;
	win: null | Player;
	setupTs: number;
	ts: Record<Player, number>;
	taken: Record<Player, Record<Rank, number>>;
};
export class ChesXplore extends ChessBoard<PieceMeta> {
	static save(key: string, chess: ChesXplore) {
		localStorage.setItem(
			key,
			JSON.stringify({
				exp: Date.now() + 60000,
				pieces: chess.getPieces().map((x) => x.toPiece()),
				logs: get(chess.logs),
				state: get(chess.state),
				setup: chess.setup,
				spawning: chess.spawning,
				kingKilled: chess.kingKilled,
				upgrade: chess.upgrade
			})
		);
	}
	static empty(root: HTMLElement, boardSize: number) {
		return new ChesXplore(root, boardSize, [
			new ChesXploreXPiece('B', 'P', 0, 6, { isFirst: true }),
			new ChesXploreXPiece('B', 'P', 1, 6, { isFirst: true }),
			new ChesXploreXPiece('B', 'P', 2, 6, { isFirst: true }),
			new ChesXploreXPiece('B', 'P', 3, 6, { isFirst: true }),
			new ChesXploreXPiece('B', 'P', 4, 6, { isFirst: true }),
			new ChesXploreXPiece('B', 'P', 5, 6, { isFirst: true }),
			new ChesXploreXPiece('B', 'P', 6, 6, { isFirst: true }),
			new ChesXploreXPiece('B', 'P', 7, 6, { isFirst: true }),
			new ChesXploreXPiece('W', 'P', 0, 1, { isFirst: true }),
			new ChesXploreXPiece('W', 'P', 1, 1, { isFirst: true }),
			new ChesXploreXPiece('W', 'P', 2, 1, { isFirst: true }),
			new ChesXploreXPiece('W', 'P', 3, 1, { isFirst: true }),
			new ChesXploreXPiece('W', 'P', 4, 1, { isFirst: true }),
			new ChesXploreXPiece('W', 'P', 5, 1, { isFirst: true }),
			new ChesXploreXPiece('W', 'P', 6, 1, { isFirst: true }),
			new ChesXploreXPiece('W', 'P', 7, 1, { isFirst: true })
		]);
	}
	static load(key: string, root: HTMLElement, boardSize: number) {
		const str = localStorage.getItem(key);
		if (!str) return ChesXplore.empty(root, boardSize);
		const data = JSON.parse(str);
		if (data.exp < Date.now()) return ChesXplore.empty(root, boardSize);
		const chess = new ChesXplore(
			root,
			boardSize,
			data.pieces.map((x: any) => ChesXploreXPiece.fromPiece(x))
		);
		chess.logs.set(data.logs);
		chess.state.set(data.state);
		chess.setup = data.setup;
		chess.spawning = data.spawning;
		chess.kingKilled = data.kingKilled;
		chess.upgrade = data.upgrade;
		return chess;
	}
	constructor(root: HTMLElement, boardSize: number, pieces: ChesXploreXPiece[]) {
		super(root, boardSize / 8, pieces);
		this.gameLoop();
	}
	private logs = writable<Log[]>([]);
	private state = writable<State>({
		turn: Pieces.pBlack,
		timed: Date.now(),
		setupTs: 0,
		win: null,
		ts: { [Pieces.pBlack]: 0, [Pieces.pWhite]: 0 },
		wallet: { [Pieces.pBlack]: 0, [Pieces.pWhite]: 0 },
		taken: {
			[Pieces.pBlack]: {
				[Pieces.rBishop]: 0,
				[Pieces.rKing]: 0,
				[Pieces.rKnight]: 0,
				[Pieces.rPawn]: 0,
				[Pieces.rQueen]: 0,
				[Pieces.rRook]: 0
			},
			[Pieces.pWhite]: {
				[Pieces.rBishop]: 0,
				[Pieces.rKing]: 0,
				[Pieces.rKnight]: 0,
				[Pieces.rPawn]: 0,
				[Pieces.rQueen]: 0,
				[Pieces.rRook]: 0
			}
		}
	});
	readableLogs() {
		return derived([this.logs], (x) => x[0]);
	}
	readableState() {
		return derived([this.state], (x) => x[0]);
	}
	nextTurn() {
		this.state.update((x) => {
			return {
				...x,
				timed: Date.now(),
				...(x.setupTs
					? { ts: { ...x.ts, [x.turn]: x.ts[x.turn] + (Date.now() - x.timed) } }
					: { setupTs: Date.now() - x.timed }),
				turn: x.turn === Pieces.pWhite ? Pieces.pBlack : Pieces.pWhite
			};
		});
	}
	protected removePiece(p: XPiece<PieceMeta>): void {
		this.state.update((x) => {
			return {
				...x,
				...(p.rank === Pieces.rKing
					? { win: p.player === Pieces.pWhite ? Pieces.pBlack : Pieces.pWhite }
					: {}),
				taken: {
					...x.taken,
					[p.player]: {
						...x.taken[p.player],
						[p.rank]: x.taken[p.player][p.rank] + 1
					}
				}
			};
		});
		super.removePiece(p);
	}
	incrCoins(player: Player, coin: number) {
		this.state.update((x) => {
			return {
				...x,
				wallet: {
					...x.wallet,
					[player]: Math.max(0, Math.min(x.wallet[player] + coin, 10))
				}
			};
		});
	}
	getCurrentState() {
		return structuredClone(get(this.state));
	}
	private pushLog(log: Log) {
		this.logs.update((x) => {
			x.push(log);
			return x;
		});
	}
	private setup?: {
		row: (null | Rank)[] & { length: 8 };
		canPut: Record<Rank, number>;
	} = {
		row: [null, null, null, null, null, null, null, null],
		canPut: {
			[Pieces.rKing]: 1,
			[Pieces.rQueen]: 1,
			[Pieces.rBishop]: 2,
			[Pieces.rRook]: 2,
			[Pieces.rKnight]: 2,
			[Pieces.rPawn]: 0
		}
	};
	private kingKilled: ChesXploreXPiece | null = null;
	private spawning = new Set<ChesXploreXPiece>();
	private upgrade?: ChesXploreXPiece;
	protected gameLoop() {
		for (const p of this.spawning) {
			if (p.player === this.getCurrentState().turn) {
				delete p.meta.isSpawning;
				p.meta.isFirst = true;
				this.spawning.delete(p);
			} else {
				p.meta.isSpawning = true;
			}
		}
		this.paintPlainCurrentState(); // clear everything!
		if (this.kingKilled) {
			for (const p of this.getPieces()) {
				if (p.rank === Pieces.rKing) {
					this.focusInteractions(p.colIndex, p.rowIndex, 'primary');
				}
			}
			return;
		}
		SETUP: if (this.setup) {
			if (this.setup.row.every((x) => x !== null)) {
				this.nextTurn();
				this.pushLog({
					type: 'setup',
					piece: this.getCurrentSetup(),
					walletSnap: this.getCurrentState().wallet
				});
				delete this.setup;
				break SETUP;
			}
			for (let colIndex = 0; colIndex < this.setup.row.length; colIndex++) {
				if (this.setup.row[colIndex] === null) {
					this.allowFieldClick(colIndex, 7);
					this.focusInteractions(colIndex, 7, 'secondary');
				}
			}
			return;
		}
		if (this.upgrade) {
			this.focusInteractions(this.upgrade.colIndex, this.upgrade.rowIndex, 'primary');
			this.openSelection(
				this.upgrade.colIndex,
				this.upgrade.rowIndex,
				this.getCurrentState().turn,
				[Pieces.rQueen, Pieces.rBishop, Pieces.rRook, Pieces.rKnight],
				false
			);
			return;
		}
		for (const p of this.getPieces()) {
			if (p.player === this.getCurrentState().turn) {
				this.allowPiecePicking(p);
			}
		}
		for (const rowIndex of this.getCurrentState().turn === Pieces.pBlack ? [7, 6, 5] : [0, 1, 2]) {
			for (const colIndex of [0, 1, 2, 3, 4, 5, 6, 7]) {
				if (!this.pieceAt(colIndex, rowIndex)) {
					this.allowFieldClick(colIndex, rowIndex);
				}
			}
		}
	}
	protected override onFieldClick(colIndex: number, rowIndex: number): void {
		if (this.setup) {
			this.clearFocusInteractions('*');
			this.clearFieldClick();
			this.focusInteractions(colIndex, rowIndex, 'primary');
			const ranks: Rank[] = [];
			for (const [rank, avl] of Object.entries(this.setup.canPut)) {
				if (avl > 0) ranks.push(rank as Rank);
			}
			this.openSelection(colIndex, rowIndex, Pieces.pBlack, ranks, true);
			return;
		}
		this.clearPickables();
		this.clearFocusInteractions('*');
		this.focusInteractions(colIndex, rowIndex, 'primary');
		this.clearFieldClick();
		const ranks = canSpawnPieces(this, this.getCurrentState().turn, colIndex, rowIndex);
		if (ranks.length) {
			this.openSelection(colIndex, rowIndex, this.getCurrentState().turn, ranks, true);
		} else {
			this.gameLoop();
		}
	}
	protected override onSelect(
		colIndex: number,
		rowIndex: number,
		player: Player,
		rank: Rank
	): void {
		if (this.setup) {
			this.insertPiece(new ChesXploreXPiece(Pieces.pBlack, rank, colIndex, 7, { isFirst: true }));
			this.insertPiece(new ChesXploreXPiece(Pieces.pWhite, rank, colIndex, 0, { isFirst: true }));
			this.setup.canPut[rank]--;
			this.setup.row[colIndex] = rank;
			this.gameLoop();
			return;
		}
		if (this.upgrade) {
			const p = new XPiece(player, rank, colIndex, rowIndex, {});
			this.incrCoins(Pieces.pBlack, 0.5);
			this.incrCoins(Pieces.pWhite, 0.5);
			this.pushLog({
				type: 'upgrade',
				upgradeTo: p.toPiece(),
				piece: this.upgrade.toPiece(),
				walletSnap: this.getCurrentState().wallet
			});
			this.insertPiece(p);
			this.removePiece(this.upgrade);
			this.nextTurn();
			delete this.upgrade;
			this.gameLoop();
			return;
		}
		const p = new XPiece(this.getCurrentState().turn, rank, colIndex, rowIndex, {
			isSpawning: true
		});
		this.insertPiece(p);
		const cost = ChesXplore.Cost[rank as Exclude<Rank, typeof Pieces.rKing>][0];
		this.incrCoins(this.getCurrentState().turn, -cost);
		this.incrCoins(Pieces.pBlack, 0.5);
		this.incrCoins(Pieces.pWhite, 0.5);
		this.pushLog({
			type: 'spawning',
			cost,
			piece: p.toPiece(),
			walletSnap: this.getCurrentState().wallet
		});
		this.spawning.add(p);
		this.nextTurn();
		this.gameLoop();
	}
	protected override onSelectCancel(): void {
		this.gameLoop();
	}
	getPieceStatus(
		p: ChesXploreXPiece
	): 'first' | 'ghost' | 'kill-1' | 'kill-2' | `coin-${number}` | null {
		if (p.rank === Pieces.rKing) {
			return `coin-${this.getCurrentState().wallet[p.player]}`;
		}
		if (p.meta.isSpawning) return 'ghost';
		if (p.meta.isFirst) return 'first';
		if (p.meta.killed === 1) return 'kill-1';
		if (p.meta.killed === 2) return 'kill-2';
		return null;
	}
	pieceInfo(self: Player, p: ChesXploreXPiece | null) {
		if (!p) return 'empty';
		if (p.meta.isSpawning) return 'ghost';
		if (p.player !== self) return 'oponent';
		return 'self';
	}
	protected override onPieceGrab(p: ChesXploreXPiece): void {
		this.clearFieldClick();
		this.clearFocusInteractions('*');
		this.focusInteractions(p.colIndex, p.rowIndex, 'primary');
		const spots: [number, number][] = [];
		if (p.rank === Pieces.rPawn) {
			const rowDir = this.getCurrentState().turn === Pieces.pWhite ? +1 : -1;
			for (const step of [1, ...(p.meta.isFirst ? [2] : [])]) {
				const colIndex = p.colIndex;
				const rowIndex = p.rowIndex + rowDir * step;
				if (colIndex > 7 || colIndex < 0) break;
				if (rowIndex > 7 || rowIndex < 0) break;
				const otherP = this.pieceInfo(
					this.getCurrentState().turn,
					this.pieceAt(colIndex, rowIndex)
				);
				if (otherP === 'oponent' || otherP === 'self') break;
				spots.push([p.colIndex, rowIndex]);
			}
			for (const deltaColIndex of [1, -1]) {
				const colIndex = p.colIndex + deltaColIndex;
				const rowIndex = p.rowIndex + rowDir * 1;
				if (colIndex > 7 || colIndex < 0) continue;
				if (rowIndex > 7 || rowIndex < 0) continue;
				const otherP = this.pieceInfo(
					this.getCurrentState().turn,
					this.pieceAt(colIndex, rowIndex)
				);
				if (otherP === 'oponent') {
					spots.push([colIndex, rowIndex]);
				}
			}
		} else if (p.rank === Pieces.rKnight) {
			for (const [deltaColIndex, deltaRowIndex] of [
				[-2, -1],
				[-2, 1],
				[-1, -2],
				[-1, 2],
				[1, -2],
				[1, 2],
				[2, -1],
				[2, 1]
			] as [number, number][]) {
				const colIndex = p.colIndex + deltaColIndex;
				const rowIndex = p.rowIndex + deltaRowIndex;
				if (colIndex > 7 || colIndex < 0) continue;
				if (rowIndex > 7 || rowIndex < 0) continue;
				const otherP = this.pieceInfo(
					this.getCurrentState().turn,
					this.pieceAt(colIndex, rowIndex)
				);
				if (otherP === 'self') continue;
				spots.push([colIndex, rowIndex]);
			}
		} else if (p.rank === Pieces.rRook) {
			for (const [dirCol, dirRow] of [
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1]
			]) {
				for (const steps of [1, 2, 3, 4, 5, 6, 7]) {
					const colIndex = p.colIndex + dirCol * steps;
					const rowIndex = p.rowIndex + dirRow * steps;
					if (colIndex > 7 || colIndex < 0) break;
					if (rowIndex > 7 || rowIndex < 0) break;
					const otherP = this.pieceInfo(
						this.getCurrentState().turn,
						this.pieceAt(colIndex, rowIndex)
					);
					if (otherP === 'oponent') {
						spots.push([colIndex, rowIndex]);
						break;
					}
					if (otherP === 'self') {
						break;
					}
					spots.push([colIndex, rowIndex]);
				}
			}
		} else if (p.rank === Pieces.rBishop) {
			for (const [dirCol, dirRow] of [
				[1, 1],
				[-1, -1],
				[-1, 1],
				[1, -1]
			]) {
				for (const steps of [1, 2, 3, 4, 5, 6, 7]) {
					const colIndex = p.colIndex + dirCol * steps;
					const rowIndex = p.rowIndex + dirRow * steps;
					if (colIndex > 7 || colIndex < 0) break;
					if (rowIndex > 7 || rowIndex < 0) break;
					const otherP = this.pieceInfo(
						this.getCurrentState().turn,
						this.pieceAt(colIndex, rowIndex)
					);
					if (otherP === 'oponent') {
						spots.push([colIndex, rowIndex]);
						break;
					}
					if (otherP === 'self') {
						break;
					}
					spots.push([colIndex, rowIndex]);
				}
			}
		} else if (p.rank === Pieces.rQueen) {
			for (const [dirCol, dirRow] of [
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1],
				[1, 1],
				[-1, -1],
				[-1, 1],
				[1, -1]
			]) {
				for (const steps of [1, 2, 3, 4, 5, 6, 7]) {
					const colIndex = p.colIndex + dirCol * steps;
					const rowIndex = p.rowIndex + dirRow * steps;
					if (colIndex > 7 || colIndex < 0) break;
					if (rowIndex > 7 || rowIndex < 0) break;
					const otherP = this.pieceInfo(
						this.getCurrentState().turn,
						this.pieceAt(colIndex, rowIndex)
					);
					if (otherP === 'oponent') {
						spots.push([colIndex, rowIndex]);
						break;
					}
					if (otherP === 'self') {
						break;
					}
					spots.push([colIndex, rowIndex]);
				}
			}
		} else if (p.rank === Pieces.rKing) {
			for (const [dirCol, dirRow] of [
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1],
				[1, 1],
				[-1, -1],
				[-1, 1],
				[1, -1]
			]) {
				const colIndex = p.colIndex + dirCol * 1;
				const rowIndex = p.rowIndex + dirRow * 1;
				if (colIndex > 7 || colIndex < 0) continue;
				if (rowIndex > 7 || rowIndex < 0) continue;
				const otherP = this.pieceInfo(
					this.getCurrentState().turn,
					this.pieceAt(colIndex, rowIndex)
				);
				if (otherP === 'empty') {
					spots.push([colIndex, rowIndex]);
				}
			}
		} else {
			throw new Error('Unknown!');
		}
		for (const [colIndex, rowIndex] of spots) {
			this.focusInteractions(colIndex, rowIndex, 'secondary');
			this.allowDropSpot(colIndex, rowIndex);
		}
	}
	protected override onPieceGrabLeave(p: ChesXploreXPiece): void {
		this.gameLoop();
	}
	protected override onGrabedPieceHover(
		p: ChesXploreXPiece,
		colIndex: number,
		rowIndex: number
	): void {
		const info = movementInfo(this, p, colIndex, rowIndex);
		if (info.type === 'moved') return;
		this.focusInteractions(colIndex, rowIndex, 'danger');
		if (info.type === 'block-spawn') {
			this.showMarker(info.spawn.colIndex, info.spawn.rowIndex, `death`);
			return;
		}
		if (info.type === 'pawn-kill') {
			this.showMarker(colIndex, rowIndex, `coin-${info.reward}`);
			this.focusInteractions(colIndex, rowIndex, 'danger');
			return;
		}
		if (info.type === 'knight-kill') {
			this.showMarker(
				colIndex,
				rowIndex,
				info.willDie ? 'death' : info.killCount === 2 ? `takes-2ed` : 'takes-1st'
			);
			return;
		}
		if (info.type === 'explosion') {
			this.showMarker(colIndex, rowIndex, `explodes`);
			for (const [colIndex, rowIndex] of info.explosionLocations) {
				this.showExplosiveInteractions(colIndex, rowIndex, 'blast');
			}
			for (const p of info.explosionGarded) {
				this.showMarker(p.colIndex, p.rowIndex, 'shield');
			}
			return;
		}
		throw new Error('Unknown');
	}

	protected override onGrabedPieceHoverExit(
		p: ChesXploreXPiece,
		colIndex: number,
		rowIndex: number
	): void {
		this.clearExplosiveInteractions();
		this.clearFocusInteractions('danger');
		this.clearMarker();
	}

	protected override async onGrabedPiecePut(
		p: ChesXploreXPiece,
		colIndex: number,
		rowIndex: number
	): Promise<void> {
		const info = movementInfo(this, p, colIndex, rowIndex);
		this.incrCoins(Pieces.pBlack, 0.5);
		this.incrCoins(Pieces.pWhite, 0.5);
		if (
			info.type === 'moved' &&
			p.rank === Pieces.rPawn &&
			(this.getCurrentState().turn === Pieces.pBlack ? rowIndex === 0 : rowIndex === 7)
		) {
			this.upgrade = p;
			this.focusInteractions(colIndex, rowIndex, 'primary');
			this.openSelection(
				colIndex,
				rowIndex,
				this.getCurrentState().turn,
				[Pieces.rQueen, Pieces.rBishop, Pieces.rRook, Pieces.rKnight],
				false
			);
			return;
		}
		if (info.type === 'moved') {
			this.pushLog({
				type: 'move',
				piece: p.toPiece(),
				walletSnap: this.getCurrentState().wallet,
				to: [XPiece.colVal(colIndex), XPiece.rowVal(rowIndex)]
			});
		} else if (info.type === 'block-spawn') {
			this.pushLog({
				type: 'move',
				piece: p.toPiece(),
				walletSnap: this.getCurrentState().wallet,
				to: [XPiece.colVal(colIndex), XPiece.rowVal(rowIndex)]
			});
			this.spawning.delete(info.spawn);
			this.pushLog({
				type: 'block-spawn',
				spawnBlocked: info.spawn.toPiece(),
				piece: p.toPiece(),
				walletSnap: this.getCurrentState().wallet
			});
		} else if (info.type === 'pawn-kill') {
			this.incrCoins(this.getCurrentState().turn, info.reward);
			this.pushLog({
				type: 'move-attack',
				piece: p.toPiece(),
				to: [info.killed.colVal(), info.killed.rowVal()],
				selfKilled: true,
				walletSnap: this.getCurrentState().wallet,
				rewardCoins: info.reward,
				targetKilled: info.killed.toPiece(),
				blasticKilled: []
			});
		} else if (info.type === 'knight-kill') {
			p.meta.killed = info.killCount;
			this.pushLog({
				type: 'move-attack',
				piece: p.toPiece(),
				to: [info.killed.colVal(), info.killed.rowVal()],
				selfKilled: info.willDie,
				walletSnap: this.getCurrentState().wallet,
				rewardCoins: 0,
				targetKilled: info.killed.toPiece(),
				blasticKilled: []
			});
		} else if (info.type === 'explosion') {
			this.pushLog({
				type: 'move-attack',
				piece: p.toPiece(),
				to: [info.killed.colVal(), info.killed.rowVal()],
				selfKilled: true,
				walletSnap: this.getCurrentState().wallet,
				rewardCoins: 0,
				targetKilled: info.killed.toPiece(),
				blasticKilled: info.explosionKilled.map((x) => x.toPiece())
			});
		} else {
			throw new Error('Unkonwn!');
		}
		await this.movePiece(p, colIndex, rowIndex);
		if (info.type === 'pawn-kill') {
			this.removePiece(p);
			this.removePiece(info.killed);
			if (info.killed.rank === Pieces.rKing) {
				this.kingKilled = info.killed;
			}
		} else if (info.type === 'block-spawn') {
			this.removePiece(p);
			this.removePiece(info.spawn);
		} else if (info.type === 'knight-kill') {
			if (info.willDie) this.removePiece(p);
			this.removePiece(info.killed);
			if (info.killed.rank === Pieces.rKing) {
				this.kingKilled = info.killed;
			}
		} else if (info.type === 'explosion') {
			this.removePiece(p);
			this.removePiece(info.killed);
			if (info.killed.rank === Pieces.rKing) {
				this.kingKilled = info.killed;
			}
			for (const p of info.explosionKilled) {
				this.removePiece(p);
			}
		}
		if (p.meta.isFirst) delete p.meta.isFirst;
		this.nextTurn();
		this.gameLoop();
	}
	static Cost: Record<Exclude<Rank, typeof Pieces.rKing>, [number, number]> = {
		[Pieces.rQueen]: [7, 1],
		[Pieces.rRook]: [5, 2],
		[Pieces.rBishop]: [5, 2],
		[Pieces.rKnight]: [4.5, 3],
		[Pieces.rPawn]: [3, 3]
	};
	static Reward: Record<Rank, number> = {
		[Pieces.rKing]: Number.POSITIVE_INFINITY,
		[Pieces.rQueen]: 3,
		[Pieces.rRook]: 2,
		[Pieces.rBishop]: 2,
		[Pieces.rKnight]: 2.5,
		[Pieces.rPawn]: 1.5
	};
}

function canSpawnPieces(chess: ChesXplore, player: Player, colIndex: number, rowIndex: number) {
	let lane = 5;
	if (rowIndex === 0 || rowIndex === 7) {
		lane = 1;
	} else if (rowIndex === 1 || rowIndex === 6) {
		lane = 2;
	} else if (rowIndex === 2 || rowIndex === 5) {
		lane = 3;
	} else {
		lane = 4;
	}
	const coins = chess.getCurrentState().wallet[player];
	const ranks: Rank[] = [];
	for (const [rank, [cost, allowedLane]] of Object.entries(ChesXplore.Cost)) {
		if (coins >= cost && lane <= allowedLane) {
			ranks.push(rank as Rank);
		}
	}
	return ranks;
}

function movementInfo(
	chess: ChesXplore,
	p: ChesXploreXPiece,
	colIndex: number,
	rowIndex: number
):
	| { type: 'moved' }
	| { type: 'block-spawn'; spawn: ChesXploreXPiece; willDie: true }
	| { type: 'knight-kill'; killed: ChesXploreXPiece; willDie: boolean; killCount: number }
	| { type: 'pawn-kill'; killed: ChesXploreXPiece; reward: number; willDie: true }
	| {
			type: 'explosion';
			killed: ChesXploreXPiece;
			explosionKilled: ChesXploreXPiece[];
			explosionGarded: ChesXploreXPiece[];
			explosionLocations: [number, number][];
	  } {
	const player = p.player;
	const otherP = chess.pieceAt(colIndex, rowIndex);
	if (!otherP) return { type: 'moved' };
	if (chess.pieceInfo(player, otherP) === 'ghost') {
		return { type: 'block-spawn', spawn: otherP, willDie: true };
	}
	if (p.rank === Pieces.rPawn) {
		return {
			type: 'pawn-kill',
			killed: otherP,
			reward: ChesXplore.Reward[otherP.rank],
			willDie: true
		};
	}
	if (p.rank === Pieces.rKnight) {
		if (p.meta.killed === 2) {
			return { type: 'knight-kill', killCount: 3, killed: otherP, willDie: true };
		} else {
			return {
				type: 'knight-kill',
				killCount: (p.meta.killed ?? 0) + 1,
				killed: otherP,
				willDie: false
			};
		}
	}
	const explosionLocations: [number, number][] = [];
	if (p.rank === Pieces.rRook) {
		const colDir = Math.sign(colIndex - p.colIndex);
		const rowDir = Math.sign(rowIndex - p.rowIndex);
		for (const [expecetedColDir, expecetedRowDir, deltaExplosionsIndex] of JSON.parse(`[
	      [0, 1, [[1, 1], [-1, 1]]],
			  [0, -1, [[1, -1], [-1, -1]]],
				[1, 0, [[1, 1], [1, -1]]],
				[-1, 0, [[-1, 1], [-1, -1]]]
			]`) as [number, number, [number, number][]][]) {
			if (expecetedColDir === colDir && expecetedRowDir === rowDir) {
				for (const [deltaColIndex, deltaRowIndex] of deltaExplosionsIndex) {
					explosionLocations.push([colIndex + deltaColIndex, rowIndex + deltaRowIndex]);
				}
				break;
			}
		}
	} else if (p.rank === Pieces.rBishop) {
		const colDir = Math.sign(colIndex - p.colIndex);
		const rowDir = Math.sign(rowIndex - p.rowIndex);
		for (const [expecetedColDir, expecetedRowDir, deltaExplosionsIndex] of JSON.parse(`[
	      [1, 1, [[1, 0], [0, 1]]],
			  [1, -1, [[0, -1], [1, 0]]],
				[-1, 1, [[-1, 0], [0, 1]]],
				[-1, -1, [[-1, 0], [0, -1]]]
			]`) as [number, number, [number, number][]][]) {
			if (expecetedColDir === colDir && expecetedRowDir === rowDir) {
				for (const [deltaColIndex, deltaRowIndex] of deltaExplosionsIndex) {
					explosionLocations.push([colIndex + deltaColIndex, rowIndex + deltaRowIndex]);
				}
				break;
			}
		}
	} else if (p.rank === Pieces.rQueen) {
		const colDir = Math.sign(colIndex - p.colIndex);
		const rowDir = Math.sign(rowIndex - p.rowIndex);
		for (const [deltaColIndex, deltaRowIndex] of [
			[0, 1],
			[0, -1],
			[1, 0],
			[-1, 0],
			[1, 1],
			[1, -1],
			[-1, 1],
			[-1, -1]
		]) {
			if (!(deltaColIndex === colDir && deltaRowIndex === rowDir)) {
				explosionLocations.push([colIndex + deltaColIndex, rowIndex + deltaRowIndex]);
			}
		}
	} else {
		throw new Error('Unknown');
	}
	const explosionKilled: ChesXploreXPiece[] = [];
	const explosionGarded: ChesXploreXPiece[] = [];
	for (const [colIndex, rowIndex] of explosionLocations) {
		const p = chess.pieceAt(colIndex, rowIndex);
		if (p) {
			if (p.player === player || p.rank === Pieces.rKing || p.rank === Pieces.rPawn) {
				explosionGarded.push(p);
			} else {
				explosionKilled.push(p);
			}
		}
	}
	return {
		type: 'explosion',
		explosionGarded,
		explosionKilled,
		explosionLocations,
		killed: otherP
	};
}
