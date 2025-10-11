import { Position, type Col, type Piece, type Player, type Rank, type Row, delay } from './const';

export class XPiece<T> {
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

export abstract class ChessBoard<T> {
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
	private elements: Record<string, Set<HTMLDivElement>> = {};
	addElement(key: string, val: HTMLDivElement) {
		this.elements[key] ??= new Set();
		this.elements[key].add(val);
	}
	clearElements(key: string) {
		if (!this.elements[key]) return;
		for (const div of this.elements[key]) {
			div.remove();
		}
		delete this.elements[key];
	}
	private selectionPopup: HTMLDivElement | null = null;
	private pickablePieces: XPiece<T>[] = [];
	private grabedPiece: null | XPiece<T> = null;
	private scalingFactor: number = 1;
	setScalingFactor(scale: number) {
		this.scalingFactor = scale;
	}
	abstract getPieceStatus(
		p: XPiece<T>
	): 'first' | 'ghost' | 'kill-1' | 'kill-2' | `coin-${number}` | null;
	protected paintPlainCurrentState() {
		this.boardDiv = null;
		this.elements = {};
		this.pickablePieces = [];
		this.grabedPiece = null;
		this.startX = 0;
		this.startY = 0;
		this.dRow = 0;
		this.dCol = 0;
		this.selectionPopup = null;
		this.lstHovered = null;
		this.hoverDiv = null;
		this.dropableSpots = [];
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
				this.addElement('tileDivs', tileDiv);
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
		this.addElement('explosiveDivs', div);
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
		this.clearElements('explosiveDivs');
	}
	protected showMarker(
		colIndex: number,
		rowIndex: number,
		type: `coin-${number}` | 'death' | 'takes-1st' | 'takes-2ed' | 'explodes' | 'shield'
	) {
		if (colIndex >= 8 || colIndex <= -1) return;
		if (rowIndex >= 8 || rowIndex <= -1) return;
		const div = document.createElement('div');
		this.addElement('markerDivs', div);
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
		this.clearElements('markerDivs');
	}
	protected focusInteractions(
		colIndex: number,
		rowIndex: number,
		type: 'primary' | 'secondary' | 'danger'
	) {
		if (colIndex >= 8 || colIndex <= -1) return;
		if (rowIndex >= 8 || rowIndex <= -1) return;
		const div = document.createElement('div');
		this.addElement(
			type === 'primary'
				? 'focusPrimaryDivs'
				: type === 'danger'
					? 'focusDangerDivs'
					: 'focusSecondaryDivs',
			div
		);
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
			this.clearElements('focusPrimaryDivs');
		}
		if (type === '*' || type === 'secondary') {
			this.clearElements('focusSecondaryDivs');
		}
		if (type === '*' || type === 'danger') {
			this.clearElements('focusDangerDivs');
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
		this.addElement('fieldClickDivs', div);
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
		this.clearElements('fieldClickDivs');
	}
	protected abstract onFieldClick(colIndex: number, rowIndex: number): void;
	protected openSelection(
		colIndex: number,
		rowIndex: number,
		player: Player,
		ranks: Rank[],
		cancelable: boolean
	) {
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
		const width =
			(ranks.length + (cancelable ? 1 : 0)) * selecetionCellSize + (2 * this.cellSize) / 50;
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
		if (cancelable) {
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
