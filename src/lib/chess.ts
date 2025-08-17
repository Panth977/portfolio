export const Position = {
	// column
	cA: 'A',
	cB: 'B',
	cC: 'C',
	cD: 'D',
	cE: 'E',
	cF: 'F',
	cG: 'G',
	cH: 'H',
	// row
	r1: '1',
	r2: '2',
	r3: '3',
	r4: '4',
	r5: '5',
	r6: '6',
	r7: '7',
	r8: '8'
} as const;
const Pieces = {
	// player
	pWhite: 'W',
	pBlack: 'B',
	// char
	rQueen: 'Q',
	rKing: 'K',
	rPawn: 'P',
	rKnight: 'N',
	rRook: 'R',
	rBishop: 'B'
} as const;
export type Row = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type Col = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
type Player = 'W' | 'B';
type Rank = 'Q' | 'K' | 'P' | 'N' | 'R' | 'B';
type Piece<T> = [Player, Rank, Col, Row, T];

class XPiece<T> {
	constructor(
		public player: Player,
		public rank: Rank,
		public colIndex: number,
		public rowIndex: number,
		public meta: T
	) {}
	static fromPiece<T>([player, rank, colVal, rowVal, meta]: Piece<T>): XPiece<T> {
		return new XPiece<T>(
			player,
			rank,
			XPiece.colIndexOf(colVal),
			XPiece.rowIndexOf(rowVal),
			structuredClone(meta)
		);
	}
	toPiece(): Piece<T> {
		return [this.player, this.rank, this.colVal(), this.rowVal(), structuredClone(this.meta)];
	}
	div?: HTMLDivElement;
	rowVal(): Row {
		return XPiece.rowVal(this.rowIndex);
	}
	colVal(): Col {
		return XPiece.colVal(this.colIndex);
	}
	nameOf() {
		return XPiece.nameOf(this.player, this.rank);
	}
	static nameOf(player: Player, rank: Rank) {
		return `${player}${rank}`;
	}
	static rowVal(rowIndex: number): Row {
		switch (rowIndex) {
			case 0:
				return Position.r1;
			case 1:
				return Position.r2;
			case 2:
				return Position.r3;
			case 3:
				return Position.r4;
			case 4:
				return Position.r5;
			case 5:
				return Position.r6;
			case 6:
				return Position.r7;
			case 7:
				return Position.r8;
			default:
				throw new Error('Unknown row possition!');
		}
	}
	static colVal(colIndex: number): Col {
		switch (colIndex) {
			case 0:
				return Position.cA;
			case 1:
				return Position.cB;
			case 2:
				return Position.cC;
			case 3:
				return Position.cD;
			case 4:
				return Position.cE;
			case 5:
				return Position.cF;
			case 6:
				return Position.cG;
			case 7:
				return Position.cH;
			default:
				throw new Error('Unknown col possition!');
		}
	}
	static rowIndexOf(rowVal: Row): number {
		switch (rowVal) {
			case Position.r1:
				return 0;
			case Position.r2:
				return 1;
			case Position.r3:
				return 2;
			case Position.r4:
				return 3;
			case Position.r5:
				return 4;
			case Position.r6:
				return 5;
			case Position.r7:
				return 6;
			case Position.r8:
				return 7;
			default:
				throw new Error('Unknown row possition!');
		}
	}
	static colIndexOf(colVal: Col): number {
		switch (colVal) {
			case Position.cA:
				return 0;
			case Position.cB:
				return 1;
			case Position.cC:
				return 2;
			case Position.cD:
				return 3;
			case Position.cE:
				return 4;
			case Position.cF:
				return 5;
			case Position.cG:
				return 6;
			case Position.cH:
				return 7;
			default:
				throw new Error('Unknown col possition!');
		}
	}
}

abstract class ChessBoard<T> {
	protected constructor(
		protected root: HTMLElement,
		private cellSize: number,
		private pieces: XPiece<T>[]
	) {
		this.paintPlainCurrentState();
	}
	pieceAt(colIndex: number, rowIndex: number) {
		for (const p of this.pieces) {
			if (p.rowIndex === rowIndex && p.colIndex === colIndex) return p;
		}
		return null;
	}
	private boardDiv: null | HTMLDivElement = null;
	private tileDivs: HTMLDivElement[] = [];
	private explosiveDivs: HTMLDivElement[] = [];
	private markerDivs: HTMLDivElement[] = [];
	private focusPrimaryDivs: HTMLDivElement[] = [];
	private focusSecondaryDivs: HTMLDivElement[] = [];
	private focusDangerDivs: HTMLDivElement[] = [];
	private pickablePieces: XPiece<T>[] = [];
	private grabedPiece: null | XPiece<T> = null;
	private selectionPopup: HTMLDivElement | null = null;
	private fieldClickDivs: HTMLDivElement[] = [];
	private scalingFactor: number = 1;
	setScalingFactor(scale: number) {
		this.scalingFactor = scale;
	}
	abstract getPieceStatus(
		p: XPiece<T>
	): 'first' | 'ghost' | 'kill-1' | 'kill-2' | `coin-${number}` | null;
	protected paintPlainCurrentState() {
		this.boardDiv = null;
		this.tileDivs = [];
		this.explosiveDivs = [];
		this.markerDivs = [];
		this.focusPrimaryDivs = [];
		this.focusSecondaryDivs = [];
		this.focusDangerDivs = [];
		this.pickablePieces = [];
		this.grabedPiece = null;
		this.startX = 0;
		this.startY = 0;
		this.dRow = 0;
		this.dCol = 0;
		this.lstHovered = null;
		this.hoverDiv = null;
		this.dropableSpots = [];
		this.selectionPopup = null;
		this.fieldClickDivs = [];
		this.root.innerHTML = '';
		const boardDiv = document.createElement('div');
		this.boardDiv = boardDiv;
		this.root.appendChild(boardDiv);
		const cellSize = this.cellSize;
		const size = cellSize * 8;
		boardDiv.style.setProperty(`position`, `relative`);
		boardDiv.style.setProperty('height', `${size}px`);
		boardDiv.style.setProperty('width', `${size}px`);
		boardDiv.style.setProperty(`-webkit-user-select`, 'none');
		boardDiv.style.setProperty(`-ms-user-select`, 'none');
		boardDiv.style.setProperty(`user-select`, 'none');
		boardDiv.style.setProperty(`font-family`, '"Courier New", Courier, monospace');
		boardDiv.style.setProperty(`font-weight`, '900');
		boardDiv.style.setProperty(`font-size`, `${cellSize * 0.1875}px`);
		boardDiv.style.setProperty(`color`, `black`);

		for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
			for (let colIndex = 0; colIndex < 8; colIndex++) {
				const tileDiv = document.createElement('div');
				boardDiv.appendChild(tileDiv);
				this.tileDivs.push(tileDiv);
				tileDiv.style.setProperty(`position`, `absolute`);
				tileDiv.style.setProperty(`bottom`, `${rowIndex * cellSize}px`);
				tileDiv.style.setProperty(`left`, `${colIndex * cellSize}px`);
				tileDiv.style.setProperty('height', `${cellSize}px`);
				tileDiv.style.setProperty('width', `${cellSize}px`);
				if ((rowIndex + colIndex) % 2 === 0) {
					tileDiv.style.setProperty(`background-color`, `rgb(129, 150, 92)`);
					tileDiv.style.setProperty(`color`, `rgb(237, 237, 212)`);
				} else {
					tileDiv.style.setProperty(`background-color`, `rgb(237, 237, 212)`);
					tileDiv.style.setProperty(`color`, `rgb(129, 150, 92)`);
				}
				tileDiv.style.setProperty(`z-index`, `0`);
				if (rowIndex === 0) {
					const span = document.createElement('span');
					tileDiv.appendChild(span);
					span.style.setProperty(`position`, `absolute`);
					span.style.setProperty(`bottom`, `${cellSize * 0.0666}px`);
					span.style.setProperty(`right`, `${cellSize * 0.0666}px`);
					span.innerText = XPiece.colVal(colIndex);
				}
				if (colIndex === 0) {
					const span = document.createElement('span');
					tileDiv.appendChild(span);
					span.style.setProperty(`position`, `absolute`);
					span.style.setProperty(`top`, `${cellSize * 0.0666}px`);
					span.style.setProperty(`left`, `${cellSize * 0.0666}px`);
					span.innerText = XPiece.rowVal(rowIndex);
				}
			}
		}
		for (const p of this.pieces) {
			const pieceDiv = document.createElement('div');
			boardDiv.appendChild(pieceDiv);
			p.div = pieceDiv;
			pieceDiv.style.setProperty(`position`, `absolute`);
			pieceDiv.style.setProperty(`bottom`, `${p.rowIndex * cellSize}px`);
			pieceDiv.style.setProperty(`left`, `${p.colIndex * cellSize}px`);
			pieceDiv.style.setProperty('height', `${cellSize}px`);
			pieceDiv.style.setProperty('width', `${cellSize}px`);
			pieceDiv.style.setProperty(`padding`, `${cellSize * 0.1}px`);
			pieceDiv.style.setProperty(`z-index`, `10`);
			const div = document.createElement('div');
			pieceDiv.appendChild(div);
			div.style.setProperty(`background-image`, `url(chess/pieces/${p.nameOf()}.png)`);
			div.style.setProperty(`background-size`, `cover`);
			div.style.setProperty(`background-repeat`, `no-repeat`);
			div.style.setProperty(`background-position`, `center`);
			div.style.setProperty(`width`, `100%`);
			div.style.setProperty(`height`, `100%`);

			const span = document.createElement('span');
			pieceDiv.appendChild(span);
			span.style.setProperty(`position`, `absolute`);
			span.style.setProperty(`top`, `${cellSize * 0.0666}px`);
			span.style.setProperty(`right`, `${cellSize * 0.0666}px`);
			const status = this.getPieceStatus(p);
			if (status === 'ghost') {
				span.innerText = `👻`;
			} else if (status === 'kill-1') {
				span.innerText = `❗️`;
			} else if (status === 'kill-2') {
				span.innerText = `‼️`;
			} else if (status === 'first') {
				span.innerText = `🆕`;
			} else if (status?.startsWith(`coin-`)) {
				const [_, coin] = status.split('-');
				span.innerText = `💲${coin}`;
			}
			pieceDiv.onclick = null;
		}
	}
	protected showExplosiveInteractions(
		colIndex: number,
		rowIndex: number,
		type: 'blast' | 'shield'
	) {
		if (colIndex >= 8 || colIndex <= -1) return;
		if (rowIndex >= 8 || rowIndex <= -1) return;
		const div = document.createElement('div');
		this.explosiveDivs.push(div);
		this.boardDiv!.appendChild(div);
		div.style.setProperty(`position`, `absolute`);
		div.style.setProperty(`bottom`, `${rowIndex * this.cellSize}px`);
		div.style.setProperty(`left`, `${colIndex * this.cellSize}px`);
		if (type === 'blast') {
			div.style.setProperty(`background-image`, `url(chess/blast.png)`);
		} else if (type === 'shield') {
			div.style.setProperty(`background-image`, `url(chess/shield.png)`);
		}
		div.style.setProperty(`background-size`, `cover`);
		div.style.setProperty(`background-repeat`, `no-repeat`);
		div.style.setProperty(`background-position`, `center`);
		div.style.setProperty('height', `${this.cellSize}px`);
		div.style.setProperty('width', `${this.cellSize}px`);
		div.style.setProperty(`z-index`, `5`);
	}
	protected clearExplosiveInteractions() {
		for (const div of this.explosiveDivs) {
			div.remove();
		}
		this.explosiveDivs = [];
	}
	protected showMarker(
		colIndex: number,
		rowIndex: number,
		type: `coin-${number}` | 'death' | 'takes-1st' | 'takes-2ed' | 'explodes' | 'shield'
	) {
		if (colIndex >= 8 || colIndex <= -1) return;
		if (rowIndex >= 8 || rowIndex <= -1) return;
		const div = document.createElement('div');
		this.markerDivs.push(div);
		this.boardDiv!.appendChild(div);
		div.style.setProperty(`position`, `absolute`);
		div.style.setProperty(`bottom`, `${rowIndex * this.cellSize}px`);
		div.style.setProperty(`left`, `${colIndex * this.cellSize}px`);
		div.style.setProperty('height', `${this.cellSize}px`);
		div.style.setProperty('width', `${this.cellSize}px`);
		div.style.setProperty(`z-index`, `11`);
		const span = document.createElement('span');
		div.appendChild(span);
		span.style.setProperty('border', `${this.cellSize * 0.01}px solid black`);
		span.style.setProperty('background-color', 'white');
		span.style.setProperty('padding-right', `${this.cellSize * 0.0333}px`);
		span.style.setProperty('padding-left', `${this.cellSize * 0.0333}px`);
		span.style.setProperty(`position`, `absolute`);
		span.style.setProperty(`bottom`, `${this.cellSize * 0.0666}px`);
		span.style.setProperty(`left`, `${this.cellSize * 0.0666}px`);
		if (type === 'death') {
			span.innerText = `💀`;
		} else if (type === 'takes-1st') {
			span.innerText = `❗️`;
		} else if (type === 'takes-2ed') {
			span.innerText = `‼️`;
		} else if (type === 'explodes') {
			span.innerText = `💥`;
		} else if (type === 'shield') {
			span.innerText = `⛨`;
		} else if (type.startsWith('coin')) {
			const [_, coin] = type.split('-');
			span.innerText = `+💲${coin}`;
		}
	}
	protected clearMarker() {
		for (const div of this.markerDivs) {
			div.remove();
		}
		this.markerDivs = [];
	}
	protected focusInteractions(
		colIndex: number,
		rowIndex: number,
		type: 'primary' | 'secondary' | 'danger'
	) {
		if (colIndex >= 8 || colIndex <= -1) return;
		if (rowIndex >= 8 || rowIndex <= -1) return;
		const div = document.createElement('div');
		if (type === 'primary') {
			this.focusPrimaryDivs.push(div);
		} else if (type === 'danger') {
			this.focusDangerDivs.push(div);
		} else {
			this.focusSecondaryDivs.push(div);
		}
		this.boardDiv!.appendChild(div);
		div.style.setProperty(`position`, `absolute`);
		div.style.setProperty(`bottom`, `${rowIndex * this.cellSize}px`);
		div.style.setProperty(`left`, `${colIndex * this.cellSize}px`);
		div.style.setProperty(`padding`, `${this.cellSize * 0.04}px`);
		if (type === 'primary') {
			div.style.setProperty(`border`, `${this.cellSize * 0.04}px solid #DA9100`);
		} else if (type === 'danger') {
			div.style.setProperty(`border`, `${this.cellSize * 0.04}px solid red`);
		} else {
			div.style.setProperty(`border`, `${this.cellSize * 0.04}px solid #5C6373`);
		}
		div.style.setProperty(`z-index`, `3`);
		div.style.setProperty('height', `${this.cellSize}px`);
		div.style.setProperty('width', `${this.cellSize}px`);
	}
	protected clearFocusInteractions(type: 'primary' | 'secondary' | 'danger' | '*') {
		if (type === '*' || type === 'primary') {
			for (const div of this.focusPrimaryDivs) {
				div.remove();
			}
			this.focusPrimaryDivs = [];
		}
		if (type === '*' || type === 'secondary') {
			for (const div of this.focusSecondaryDivs) {
				div.remove();
			}
			this.focusSecondaryDivs = [];
		}
		if (type === '*' || type === 'danger') {
			for (const div of this.focusDangerDivs) {
				div.remove();
			}
			this.focusDangerDivs = [];
		}
	}
	protected async movePiece(p: XPiece<T>, colIndex: number, rowIndex: number) {
		if (colIndex >= 8 || colIndex <= -1) return;
		if (rowIndex >= 8 || rowIndex <= -1) return;
		const pieceDiv = p.div!;
		pieceDiv.style.setProperty(`z-index`, `1000`);
		pieceDiv.style.setProperty(`bottom`, `${rowIndex * this.cellSize}px`);
		pieceDiv.style.setProperty(`left`, `${colIndex * this.cellSize}px`);
		pieceDiv.style.setProperty(`transition`, `150ms`);
		pieceDiv.style.setProperty(`transition-timing-function`, `ease-in-out`);
		p.colIndex = colIndex;
		p.rowIndex = rowIndex;
		await delay(150);
		pieceDiv.style.setProperty(`z-index`, `10`);
		pieceDiv.style.removeProperty(`transition`);
		pieceDiv.style.removeProperty(`transition-timing-function`);
	}
	protected insertPiece(p: XPiece<T>) {
		const pieceDiv = document.createElement('div');
		this.boardDiv!.appendChild(pieceDiv);
		this.pieces.push(p);
		p.div = pieceDiv;
		pieceDiv.style.setProperty(`position`, `absolute`);
		pieceDiv.style.setProperty(`bottom`, `${p.rowIndex * this.cellSize}px`);
		pieceDiv.style.setProperty(`left`, `${p.colIndex * this.cellSize}px`);
		pieceDiv.style.setProperty(`background-image`, `url(chess/pieces/${p.nameOf()}.png)`);
		pieceDiv.style.setProperty(`background-size`, `cover`);
		pieceDiv.style.setProperty(`background-repeat`, `no-repeat`);
		pieceDiv.style.setProperty(`background-position`, `center`);
		pieceDiv.style.setProperty(`z-index`, `10`);
		pieceDiv.style.setProperty('height', `${this.cellSize}px`);
		pieceDiv.style.setProperty('width', `${this.cellSize}px`);
		pieceDiv.onclick = null;
	}
	protected removePiece(p: XPiece<T>) {
		p.div!.remove();
		this.pieces.splice(this.pieces.indexOf(p), 1);
		p.div = undefined;
	}
	protected allowFieldClick(colIndex: number, rowIndex: number) {
		if (colIndex >= 8 || colIndex <= -1) return;
		if (rowIndex >= 8 || rowIndex <= -1) return;
		const div = document.createElement('div');
		this.fieldClickDivs.push(div);
		this.boardDiv!.appendChild(div);
		div.style.setProperty(`cursor`, `pointer`);
		div.style.setProperty(`position`, `absolute`);
		div.style.setProperty(`bottom`, `${rowIndex * this.cellSize}px`);
		div.style.setProperty(`left`, `${colIndex * this.cellSize}px`);
		div.style.setProperty(`z-index`, `15`);
		div.style.setProperty('height', `${this.cellSize}px`);
		div.style.setProperty('width', `${this.cellSize}px`);
		div.onclick = this.onFieldClick.bind(this, colIndex, rowIndex);
	}
	protected clearFieldClick() {
		for (const div of this.fieldClickDivs) {
			div.remove();
		}
		this.fieldClickDivs = [];
	}
	protected abstract onFieldClick(colIndex: number, rowIndex: number): void;
	protected openSelection(colIndex: number, rowIndex: number, player: Player, ranks: Rank[]) {
		if (colIndex >= 8 || colIndex <= -1) return;
		if (rowIndex >= 8 || rowIndex <= -1) return;
		if (this.selectionPopup) return;
		ranks = [...new Set(ranks)];
		if (!ranks.length) return;
		const selecetionCellSize = this.cellSize * 0.7;
		const selectionDiv = document.createElement('div');
		this.boardDiv!.appendChild(selectionDiv);
		this.selectionPopup = selectionDiv;
		let X = colIndex * this.cellSize;
		let Y = rowIndex * this.cellSize;
		const height = selecetionCellSize + (2 * this.cellSize) / 50;
		const width = (ranks.length + 1) * selecetionCellSize + (2 * this.cellSize) / 50;
		if (X + width > this.cellSize * 8) {
			X = this.cellSize * 8 - width;
		}
		if (Y) {
			Y -= height;
		} else {
			Y += this.cellSize;
		}
		selectionDiv.style.setProperty(`display`, `flex`);
		selectionDiv.style.setProperty(`position`, `absolute`);
		selectionDiv.style.setProperty(`bottom`, `${Y}px`);
		selectionDiv.style.setProperty(`left`, `${X}px`);
		selectionDiv.style.setProperty(`z-index`, `30`);
		selectionDiv.style.setProperty(`border`, `${this.cellSize * 0.02}px solid #5C6373`);
		let i = 0;
		for (const rank of ranks) {
			i++;
			const div = document.createElement('div');
			selectionDiv.append(div);
			div.style.setProperty(`cursor`, `pointer`);
			div.style.setProperty(
				`background-image`,
				`url(chess/pieces/${XPiece.nameOf(player, rank)}.png)`
			);
			div.style.setProperty(`background-size`, `cover`);
			div.style.setProperty(`background-repeat`, `no-repeat`);
			div.style.setProperty(`background-position`, `center`);
			div.style.setProperty('height', `${selecetionCellSize}px`);
			div.style.setProperty('width', `${selecetionCellSize}px`);
			if (i % 2) {
				div.style.setProperty(`background-color`, `#D3D3D3`);
				div.style.setProperty(`color`, `#A9A9A9`);
			} else {
				div.style.setProperty(`background-color`, `#A9A9A9`);
				div.style.setProperty(`color`, `#D3D3D3`);
			}
			div.onclick = this.onSelect.bind(this, colIndex, rowIndex, player, rank);
		}
		const div = document.createElement('div');
		selectionDiv.append(div);
		div.style.setProperty(`cursor`, `pointer`);
		div.style.setProperty(`background-image`, `url(chess/x.png)`);
		div.style.setProperty(`background-size`, `cover`);
		div.style.setProperty(`background-repeat`, `no-repeat`);
		div.style.setProperty(`background-position`, `center`);
		div.style.setProperty('height', `${selecetionCellSize}px`);
		div.style.setProperty('width', `${selecetionCellSize}px`);
		div.style.setProperty(`background-color`, `white`);
		div.style.setProperty(`color`, `black`);
		div.onclick = this.onSelectCancel.bind(this);
	}
	protected abstract onSelect(colIndex: number, rowIndex: number, player: Player, rank: Rank): void;
	protected abstract onSelectCancel(): void;
	protected closeSelection() {
		if (!this.selectionPopup) return;
		this.selectionPopup.remove();
		this.selectionPopup = null;
	}

	// GRAB & PUT
	private startX = 0;
	private startY = 0;
	private dRow = 0;
	private dCol = 0;
	private lstHovered: [number, number] | null = null;
	private hoverDiv: HTMLDivElement | null = null;
	private dropableSpots: [number, number][] = [];
	protected allowPiecePicking(p: XPiece<T>) {
		if (!p) return;
		const pieceDiv = p.div!;
		this.pickablePieces.push(p);
		pieceDiv.style.setProperty('cursor', 'grab');
		pieceDiv.onpointerdown = this.__onpointergrab.bind(this, p);
		pieceDiv.onpointerup = pieceDiv.onpointercancel = this.__onpointerdrop.bind(this, p);
		pieceDiv.onpointermove = this.__onpointermoveandgrab.bind(this, p);
	}
	private static __preventDefaultTouchMove(ev: TouchEvent) {
		ev.preventDefault();
	}
	private __onpointergrab(p: XPiece<T>, e: PointerEvent) {
		window.addEventListener('touchmove', ChessBoard.__preventDefaultTouchMove, { passive: false });
		const pieceDiv = p.div!;
		document.documentElement.style.overflow = 'hidden';
		document.body.style.overscrollBehavior = 'contain';
		pieceDiv.style.setProperty('cursor', 'grabbing');
		pieceDiv.setPointerCapture(e.pointerId);
		this.grabedPiece = p;
		this.startX = e.clientX;
		this.startY = e.clientY;
		this.dRow = 0;
		this.dCol = 0;
		this.lstHovered = null;
		this.dropableSpots = [];
		this.onPieceGrab(p);
	}
	private async __onpointerdrop(p: XPiece<T>, e: PointerEvent) {
		window.removeEventListener('touchmove', ChessBoard.__preventDefaultTouchMove);
		const pieceDiv = p.div!;
		pieceDiv.onpointerdown = null;
		pieceDiv.onpointerup = null;
		pieceDiv.onpointercancel = null;
		pieceDiv.onpointermove = null;
		document.documentElement.style.overflow = '';
		document.body.style.overscrollBehavior = '';
		if (!this.grabedPiece) return;
		pieceDiv.style.setProperty('cursor', 'grab');
		pieceDiv.releasePointerCapture(e.pointerId);
		const fRow = p.rowIndex * this.cellSize + this.dRow;
		const fCol = p.colIndex * this.cellSize + this.dCol;
		const colIndex = Math.floor((fCol + this.cellSize / 2) / this.cellSize);
		const rowIndex = Math.floor((fRow + this.cellSize / 2) / this.cellSize);
		if (this.dropableSpots.find((x) => x[0] === colIndex && x[1] === rowIndex)) {
			this.onGrabedPiecePut(p, colIndex, rowIndex);
		} else {
			await this.movePiece(p, p.colIndex, p.rowIndex);
			this.onPieceGrabLeave(p);
		}
		this.grabedPiece = null;
	}
	private __onpointermoveandgrab(p: XPiece<T>, e: PointerEvent) {
		const pieceDiv = p.div!;
		if (!this.grabedPiece) return;
		this.dCol = (e.clientX - this.startX) / this.scalingFactor;
		this.dRow = (this.startY - e.clientY) / this.scalingFactor;
		const fRow = p.rowIndex * this.cellSize + this.dRow;
		const fCol = p.colIndex * this.cellSize + this.dCol;
		pieceDiv.style.bottom = `${fRow}px`;
		pieceDiv.style.left = `${fCol}px`;
		const colIndex = Math.floor((fCol + this.cellSize / 2) / this.cellSize);
		const rowIndex = Math.floor((fRow + this.cellSize / 2) / this.cellSize);
		if (this.lstHovered && this.lstHovered[0] === colIndex && this.lstHovered[1] === rowIndex) {
			// nothing
		} else {
			if (this.lstHovered) {
				this.onGrabedPieceHoverExit(p, ...this.lstHovered);
				this.lstHovered = null;
				this.hoverDiv?.remove();
				this.hoverDiv = null;
			}
			if (this.dropableSpots.find((x) => x[0] === colIndex && x[1] === rowIndex)) {
				this.lstHovered = [colIndex, rowIndex];
				const div = document.createElement('div');
				this.hoverDiv = div;
				this.boardDiv!.appendChild(div);
				div.style.setProperty(`position`, `absolute`);
				div.style.setProperty(`bottom`, `${rowIndex * this.cellSize}px`);
				div.style.setProperty(`left`, `${colIndex * this.cellSize}px`);
				div.style.setProperty(`padding`, `${this.cellSize * 0.04}px`);
				div.style.setProperty(`border`, `${this.cellSize * 0.04}px solid black`);
				div.style.setProperty(`z-index`, `3`);
				div.style.setProperty('height', `${this.cellSize}px`);
				div.style.setProperty('width', `${this.cellSize}px`);
				this.onGrabedPieceHover(p, ...this.lstHovered);
			}
		}
	}
	protected clearPickables() {
		for (const p of this.pickablePieces) {
			const pieceDiv = p.div!;
			pieceDiv.style.removeProperty('cursor');
			pieceDiv.removeAttribute(`draggable`);
			pieceDiv.ondragstart = null;
			pieceDiv.ondragend = null;
		}
		this.pickablePieces = [];
	}
	protected allowDropSpot(colIndex: number, rowIndex: number) {
		if (colIndex >= 8 || colIndex <= -1) return;
		if (rowIndex >= 8 || rowIndex <= -1) return;
		if (!this.grabedPiece) return;
		this.dropableSpots.push([colIndex, rowIndex]);
	}
	protected clearDropSpots() {
		this.dropableSpots = [];
	}
	protected abstract onPieceGrab(p: XPiece<T>): void;
	protected abstract onPieceGrabLeave(p: XPiece<T>): void;
	protected abstract onGrabedPieceHover(p: XPiece<T>, colIndex: number, rowIndex: number): void;
	protected abstract onGrabedPieceHoverExit(p: XPiece<T>, colIndex: number, rowIndex: number): void;
	protected abstract onGrabedPiecePut(p: XPiece<T>, colIndex: number, rowIndex: number): void;

	getCurrentSetup(): Piece<T>[] {
		return this.pieces.map((x) => x.toPiece());
	}
	getPieces(): XPiece<T>[] {
		return [...this.pieces];
	}
}
type PieceMeta = {
	isFirst?: boolean;
	killed?: number;
	isSpawning?: boolean;
};
type SetupLog = {
	type: 'setup';
	piece: Piece<PieceMeta>[];
};
type MoveLog = {
	type: 'move';
	piece: Piece<PieceMeta>;
	to: [Col, Row];
	walletSnap: Record<Player, number>;
};
type MoveAttackLog = {
	type: 'move-attack';
	piece: Piece<PieceMeta>;
	to: [Col, Row];
	selfKilled: boolean;
	targetKilled: Piece<PieceMeta>;
	blasticKilled: Piece<PieceMeta>[];
	rewardCoins: number;
	walletSnap: Record<Player, number>;
};
type SpawnSetupLog = {
	type: 'spawn-setup';
	cost: number;
	piece: Piece<PieceMeta>;
	walletSnap: Record<Player, number>;
};
type SpawnLog = {
	type: 'spawn';
	spawned: Piece<PieceMeta>;
};
type SpawnKillLog = {
	type: 'spawn-kill';
	spawnKilled: Piece<PieceMeta>;
	killed: Piece<PieceMeta>;
};
type Log = SetupLog | MoveLog | MoveAttackLog | SpawnLog | SpawnKillLog | SpawnSetupLog;
export class ChesXplore extends ChessBoard<PieceMeta> {
	constructor(root: HTMLElement, boardSize: number) {
		super(root, boardSize / 8, [
			new XPiece('B', 'P', 0, 6, { isFirst: true }),
			new XPiece('B', 'P', 1, 6, { isFirst: true }),
			new XPiece('B', 'P', 2, 6, { isFirst: true }),
			new XPiece('B', 'P', 3, 6, { isFirst: true }),
			new XPiece('B', 'P', 4, 6, { isFirst: true }),
			new XPiece('B', 'P', 5, 6, { isFirst: true }),
			new XPiece('B', 'P', 6, 6, { isFirst: true }),
			new XPiece('B', 'P', 7, 6, { isFirst: true }),
			new XPiece('W', 'P', 0, 1, { isFirst: true }),
			new XPiece('W', 'P', 1, 1, { isFirst: true }),
			new XPiece('W', 'P', 2, 1, { isFirst: true }),
			new XPiece('W', 'P', 3, 1, { isFirst: true }),
			new XPiece('W', 'P', 4, 1, { isFirst: true }),
			new XPiece('W', 'P', 5, 1, { isFirst: true }),
			new XPiece('W', 'P', 6, 1, { isFirst: true }),
			new XPiece('W', 'P', 7, 1, { isFirst: true })
		]);
		this.gameLoop();
	}
	private logs: Log[] = [];
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
	private kingKilled: XPiece<PieceMeta> | null = null;
	private turn: Player = Pieces.pBlack;
	private spawning = new Set<XPiece<PieceMeta>>();
	private wallet: Record<Player, number> = {
		[Pieces.pBlack]: 0,
		[Pieces.pWhite]: 0
	};
	private logsDiv?: HTMLElement;
	private logHeightSize: number = 0;
	private logWidthSize: number = 0;
	mountLogs(logsDiv: HTMLElement, height: number, width: number) {
		this.logsDiv = logsDiv;
		this.logHeightSize = height;
		this.logWidthSize = width;
		this.refreshLogs();
	}
	disposeLogs() {
		if (!this.logsDiv) return;
	}
	refreshLogs() {
		if (!this.logsDiv) return;
		this.logsDiv.innerHTML = '';
		this.logsDiv.style.setProperty('height', `${this.logHeightSize}px`);
		this.logsDiv.style.setProperty('width', `${this.logWidthSize}px`);
		this.logsDiv.style.setProperty('display', 'flex');
		this.logsDiv.style.setProperty('flex-direction', 'column');
		const blackWalletDiv = document.createElement('div');
		this.logsDiv.appendChild(blackWalletDiv);
		blackWalletDiv.style.setProperty('font-size', '20px');
		blackWalletDiv.style.setProperty('background-color', 'black');
		blackWalletDiv.style.setProperty('color', 'white');
		blackWalletDiv.style.setProperty('padding', '10px');
		blackWalletDiv.style.setProperty('height', '55px');
		blackWalletDiv.innerHTML = `
    <div>
      Black:
      <span style="color: gold"> ${this.wallet[Pieces.pBlack]} coins </span>
      <span style="display: ${this.turn === Pieces.pBlack ? 'inline' : 'none'}; background-color: deeppink; padding-inline: 5px"> TURN </span>
    </div>
    <div style="height: 5px; width: 100%; min-width: 200px; background-color: gray">
      <div style="height: 100%; width: ${(this.wallet[Pieces.pBlack] / 10) * 100}%; background-color: gold">
      </div>
    </div>
    `;
		const logsDiv = document.createElement('div');
		this.logsDiv.appendChild(logsDiv);
		logsDiv.style.setProperty('background-color', 'gray');
		logsDiv.style.setProperty('color', 'black');
		logsDiv.style.setProperty('padding-top', '10px');
		logsDiv.style.setProperty('height', `${this.logHeightSize - 55 - 55}px`);
		logsDiv.style.setProperty('overflow-x', 'auto');
		logsDiv.style.setProperty(`padding`, '10px');
		for (const log of this.logs.map((x, i) => ({ ...x, i: i + 1 })).reverse()) {
			const div = document.createElement('div');
			div.style.setProperty('border-bottom', '1px solid black');
			logsDiv.appendChild(div);
			function previewPiece(p: Piece<PieceMeta>) {
				return `<img src="chess/pieces/${p[0]}${p[1]}.png" style="display: inline; height: 20px" />${p[2].toLowerCase()}${p[3]}`;
			}
			function previewLoc(p: [Col, Row]) {
				return `${p[0].toLowerCase()}${p[1]}`;
			}
			if (log.type === 'setup') {
				div.innerHTML = `SETUP: ${log.piece
					.filter((x) => x[3] === Position.r8)
					.sort((x, y) => XPiece.colIndexOf(x[2]) - XPiece.colIndexOf(y[2]))
					.map(
						(x) =>
							`<img src="chess/pieces/${Pieces.pBlack}${x[1]}.png" style="display: inline; height: 20px" />`
					)
					.join('')}`;
			} else if (log.type === 'move') {
				div.innerHTML = `MOVE: ${previewPiece(log.piece)} → ${previewLoc(log.to)}`;
			} else if (log.type === 'spawn-setup') {
				div.innerHTML = `SPAWN-SETUP: ${previewPiece(log.piece)} [-💲${log.cost.toFixed(1)}]`;
			} else if (log.type === 'spawn') {
				div.innerHTML = `spawned: ${previewPiece(log.spawned)}`;
			} else if (log.type === 'spawn-kill') {
				div.innerHTML = `spawned-and-killed: ${previewPiece(log.spawnKilled)} (${previewPiece(log.killed)})`;
			} else if (log.type === 'move-attack') {
				div.innerHTML = `MOVE-ATTACK: ${log.selfKilled ? '💀' : log.piece[4].killed === 2 ? '‼️' : '❗️'} ${previewPiece(log.piece)} → (${previewPiece(log.targetKilled)}) ${log.blasticKilled.length ? `[💥 ${log.blasticKilled.map(previewPiece).join(' ')}]` : ''} ${log.rewardCoins ? `[+💲${log.rewardCoins}]` : ''}`;
			} else {
				div.innerHTML = `⚠️ UNKNOWN ⚠️`;
			}
			div.innerHTML = `${log.i}) ${div.innerHTML}`;
		}
		const whiteWalletDiv = document.createElement('div');
		this.logsDiv.appendChild(whiteWalletDiv);
		whiteWalletDiv.style.setProperty('font-size', '20px');
		whiteWalletDiv.style.setProperty('background-color', 'black');
		whiteWalletDiv.style.setProperty('color', 'white');
		whiteWalletDiv.style.setProperty('padding', '10px');
		whiteWalletDiv.style.setProperty('height', '55px');
		whiteWalletDiv.innerHTML = `
    <div>
      White:
      <span style="color: gold"> ${this.wallet[Pieces.pWhite]} coins </span>
      <span style="display: ${this.turn === Pieces.pWhite ? 'inline' : 'none'}; background-color: deeppink; padding-inline: 5px"> TURN </span>
    </div>
    <div style="height: 5px; width: 100%; min-width: 200px; background-color: gray">
      <div style="height: 100%; width: ${(this.wallet[Pieces.pWhite] / 10) * 100}%; background-color: gold">
      </div>
    </div>
    `;
	}
	protected pushLog(log: Log) {
		this.logs.push(log);
		this.refreshLogs();
	}
	protected gameLoop() {
		for (const p of this.spawning) {
			if (p.player === this.turn) {
				delete p.meta.isSpawning;
				p.meta.isFirst = true;
				this.spawning.delete(p);
				this.logs.push({ type: 'spawn', spawned: p.toPiece() });
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
				this.turn = Pieces.pWhite;
				this.logs.push({ type: 'setup', piece: this.getCurrentSetup() });
				delete this.setup;
				this.refreshLogs();
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
		for (const p of this.getPieces()) {
			if (p.player === this.turn) {
				this.allowPiecePicking(p);
			}
		}
		for (const rowIndex of this.turn === Pieces.pBlack ? [7, 6, 5] : [0, 1, 2]) {
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
			this.openSelection(colIndex, rowIndex, Pieces.pBlack, ranks);
			return;
		}
		this.clearPickables();
		this.clearFocusInteractions('*');
		this.focusInteractions(colIndex, rowIndex, 'primary');
		this.clearFieldClick();
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
		const coins = this.wallet[this.turn];
		const ranks: Rank[] = [];
		for (const [rank, [cost, allowedLane]] of Object.entries(ChesXplore.Cost)) {
			if (coins >= cost && lane <= allowedLane) {
				ranks.push(rank as Rank);
			}
		}
		if (ranks.length) {
			this.openSelection(colIndex, rowIndex, this.turn, ranks);
		} else {
			this.gameLoop();
		}
	}
	protected incr(player: Player, coin: number) {
		this.wallet[player] = Math.min(this.wallet[player] + coin, 10);
	}
	protected override onSelect(
		colIndex: number,
		rowIndex: number,
		player: Player,
		rank: Rank
	): void {
		if (this.setup) {
			this.insertPiece(new XPiece<PieceMeta>(Pieces.pBlack, rank, colIndex, 7, { isFirst: true }));
			this.insertPiece(new XPiece<PieceMeta>(Pieces.pWhite, rank, colIndex, 0, { isFirst: true }));
			this.setup.canPut[rank]--;
			this.setup.row[colIndex] = rank;
			this.gameLoop();
			return;
		}
		const p = new XPiece(this.turn, rank, colIndex, rowIndex, { isSpawning: true });
		this.insertPiece(p);
		const cost = ChesXplore.Cost[rank as Exclude<Rank, typeof Pieces.rKing>][0];
		this.incr(this.turn, -cost);
		this.incr(Pieces.pBlack, 0.5);
		this.incr(Pieces.pWhite, 0.5);
		this.logs.push({
			type: 'spawn-setup',
			cost,
			piece: p.toPiece(),
			walletSnap: structuredClone(this.wallet)
		});
		this.spawning.add(p);
		if (this.turn === Pieces.pBlack) {
			this.turn = Pieces.pWhite;
		} else {
			this.turn = Pieces.pBlack;
		}
		this.refreshLogs();
		this.gameLoop();
	}
	protected override onSelectCancel(): void {
		this.gameLoop();
	}
	getPieceStatus(
		p: XPiece<PieceMeta>
	): 'first' | 'ghost' | 'kill-1' | 'kill-2' | `coin-${number}` | null {
		if (p.rank === Pieces.rKing) {
			return `coin-${this.wallet[p.player]}`;
		}
		if (p.meta.isSpawning) return 'ghost';
		if (p.meta.isFirst) return 'first';
		if (p.meta.killed === 1) return 'kill-1';
		if (p.meta.killed === 2) return 'kill-2';
		return null;
	}
	pieceInfo(self: Player, p: XPiece<PieceMeta> | null) {
		if (!p) return 'empty';
		if (p.meta.isSpawning) return 'ghost';
		if (p.player !== self) return 'oponent';
		return 'self';
	}
	protected override onPieceGrab(p: XPiece<PieceMeta>): void {
		this.clearFieldClick();
		this.clearFocusInteractions('*');
		this.focusInteractions(p.colIndex, p.rowIndex, 'primary');
		const spots: [number, number][] = [];
		if (p.rank === Pieces.rPawn) {
			const rowDir = this.turn === Pieces.pWhite ? +1 : -1;
			for (const step of [1, ...(p.meta.isFirst ? [2] : [])]) {
				const colIndex = p.colIndex;
				const rowIndex = p.rowIndex + rowDir * step;
				if (colIndex > 7 || colIndex < 0) continue;
				if (rowIndex > 7 || rowIndex < 0) continue;
				const otherP = this.pieceInfo(this.turn, this.pieceAt(colIndex, rowIndex));
				if (otherP === 'empty' || otherP === 'ghost') {
					spots.push([p.colIndex, rowIndex]);
				}
			}
			for (const deltaColIndex of [1, -1]) {
				const colIndex = p.colIndex + deltaColIndex;
				const rowIndex = p.rowIndex + rowDir * 1;
				if (colIndex > 7 || colIndex < 0) continue;
				if (rowIndex > 7 || rowIndex < 0) continue;
				const otherP = this.pieceInfo(this.turn, this.pieceAt(colIndex, rowIndex));
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
				const otherP = this.pieceInfo(this.turn, this.pieceAt(colIndex, rowIndex));
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
					const otherP = this.pieceInfo(this.turn, this.pieceAt(colIndex, rowIndex));
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
					const otherP = this.pieceInfo(this.turn, this.pieceAt(colIndex, rowIndex));
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
					const otherP = this.pieceInfo(this.turn, this.pieceAt(colIndex, rowIndex));
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
				const otherP = this.pieceInfo(this.turn, this.pieceAt(colIndex, rowIndex));
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
	protected override onPieceGrabLeave(p: XPiece<PieceMeta>): void {
		this.gameLoop();
	}
	protected movementInfo(
		p: XPiece<PieceMeta>,
		colIndex: number,
		rowIndex: number
	):
		| { type: 'moved' }
		| { type: 'block-spawn'; spawn: XPiece<PieceMeta>; willDie: true }
		| { type: 'knight-kill'; killed: XPiece<PieceMeta>; willDie: boolean; killCount: number }
		| { type: 'pawn-kill'; killed: XPiece<PieceMeta>; reward: number; willDie: true }
		| {
				type: 'explosion';
				killed: XPiece<PieceMeta>;
				explosionKilled: XPiece<PieceMeta>[];
				explosionGarded: XPiece<PieceMeta>[];
				explosionLocations: [number, number][];
		  } {
		const otherP = this.pieceAt(colIndex, rowIndex);
		if (!otherP) return { type: 'moved' };
		if (this.pieceInfo(this.turn, otherP) === 'ghost') {
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
			this.showMarker(otherP.colIndex, otherP.rowIndex, `explodes`);
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
			this.showMarker(otherP.colIndex, otherP.rowIndex, `explodes`);
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
		const explosionKilled: XPiece<PieceMeta>[] = [];
		const explosionGarded: XPiece<PieceMeta>[] = [];
		for (const [colIndex, rowIndex] of explosionLocations) {
			const p = this.pieceAt(colIndex, rowIndex);
			if (p) {
				if (p.player === this.turn || p.rank === Pieces.rKing || p.rank === Pieces.rPawn) {
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
	protected override onGrabedPieceHover(
		p: XPiece<PieceMeta>,
		colIndex: number,
		rowIndex: number
	): void {
		const info = this.movementInfo(p, colIndex, rowIndex);
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
		p: XPiece<PieceMeta>,
		colIndex: number,
		rowIndex: number
	): void {
		this.clearExplosiveInteractions();
		this.clearFocusInteractions('danger');
		this.clearMarker();
	}

	protected override async onGrabedPiecePut(
		p: XPiece<PieceMeta>,
		colIndex: number,
		rowIndex: number
	): Promise<void> {
		const info = this.movementInfo(p, colIndex, rowIndex);
		this.incr(Pieces.pBlack, 0.5);
		this.incr(Pieces.pWhite, 0.5);
		if (info.type === 'moved') {
			this.logs.push({
				type: 'move',
				piece: p.toPiece(),
				walletSnap: structuredClone(this.wallet),
				to: [XPiece.colVal(colIndex), XPiece.rowVal(rowIndex)]
			});
		} else if (info.type === 'block-spawn') {
			this.logs.push({
				type: 'move',
				piece: p.toPiece(),
				walletSnap: structuredClone(this.wallet),
				to: [XPiece.colVal(colIndex), XPiece.rowVal(rowIndex)]
			});
			this.spawning.delete(info.spawn);
			this.logs.push({
				type: 'spawn-kill',
				killed: info.spawn.toPiece(),
				spawnKilled: p.toPiece()
			});
		} else if (info.type === 'pawn-kill') {
			this.incr(this.turn, info.reward);
			this.logs.push({
				type: 'move-attack',
				piece: p.toPiece(),
				to: [info.killed.colVal(), info.killed.rowVal()],
				selfKilled: true,
				walletSnap: structuredClone(this.wallet),
				rewardCoins: info.reward,
				targetKilled: info.killed.toPiece(),
				blasticKilled: []
			});
		} else if (info.type === 'knight-kill') {
			p.meta.killed = info.killCount;
			this.logs.push({
				type: 'move-attack',
				piece: p.toPiece(),
				to: [info.killed.colVal(), info.killed.rowVal()],
				selfKilled: info.willDie,
				walletSnap: structuredClone(this.wallet),
				rewardCoins: 0,
				targetKilled: info.killed.toPiece(),
				blasticKilled: []
			});
		} else if (info.type === 'explosion') {
			this.logs.push({
				type: 'move-attack',
				piece: p.toPiece(),
				to: [info.killed.colVal(), info.killed.rowVal()],
				selfKilled: true,
				walletSnap: structuredClone(this.wallet),
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
		delete p.meta.isFirst;
		if (this.turn === Pieces.pBlack) {
			this.turn = Pieces.pWhite;
		} else {
			this.turn = Pieces.pBlack;
		}
		this.gameLoop();
		this.refreshLogs();
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

	// FAKE
	async fakerun() {
		await delay(150);
		this.onFieldClick(0, 7);
		await delay(150);
		this.onSelect(0, 7, Pieces.pBlack, Pieces.rRook);
		await delay(150);
		this.onFieldClick(1, 7);
		await delay(150);
		this.onSelect(1, 7, Pieces.pBlack, Pieces.rBishop);
		await delay(150);
		this.onFieldClick(2, 7);
		await delay(150);
		this.onSelect(2, 7, Pieces.pBlack, Pieces.rKnight);
		await delay(150);
		this.onFieldClick(3, 7);
		await delay(150);
		this.onSelect(3, 7, Pieces.pBlack, Pieces.rQueen);
		await delay(150);
		this.onFieldClick(4, 7);
		await delay(150);
		this.onSelect(4, 7, Pieces.pBlack, Pieces.rKing);
		await delay(150);
		this.onFieldClick(5, 7);
		await delay(150);
		this.onSelect(5, 7, Pieces.pBlack, Pieces.rKnight);
		await delay(150);
		this.onFieldClick(6, 7);
		await delay(150);
		this.onSelect(6, 7, Pieces.pBlack, Pieces.rBishop);
		await delay(150);
		this.onFieldClick(7, 7);
		await delay(150);
		this.onSelect(7, 7, Pieces.pBlack, Pieces.rRook);
		await delay(150);
		this.onPieceGrab(this.pieceAt(7, 1)!);
		await delay(250);
		this.onGrabedPiecePut(this.pieceAt(7, 1)!, 7, 3);
		await delay(250);
		this.onPieceGrab(this.pieceAt(7, 6)!);
		await delay(250);
		this.onGrabedPiecePut(this.pieceAt(7, 6)!, 7, 4);
		await delay(250);
		this.onPieceGrab(this.pieceAt(7, 0)!);
		await delay(250);
		this.onGrabedPiecePut(this.pieceAt(7, 0)!, 7, 2);
		await delay(250);
		this.onPieceGrab(this.pieceAt(7, 7)!);
		await delay(250);
		this.onGrabedPiecePut(this.pieceAt(7, 7)!, 7, 5);
		await delay(250);
		this.onPieceGrab(this.pieceAt(7, 2)!);
		await delay(250);
		this.onGrabedPiecePut(this.pieceAt(7, 2)!, 5, 2);
		await delay(250);
		this.onPieceGrab(this.pieceAt(4, 6)!);
		await delay(250);
		this.onGrabedPiecePut(this.pieceAt(4, 6)!, 4, 4);
		await delay(250);
	}
}

function delay(ms: number = 200) {
	return new Promise<void>((r) => setTimeout(r, ms));
}
