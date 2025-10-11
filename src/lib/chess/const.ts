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
export const Pieces = {
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
export type Player = 'W' | 'B';
export type Rank = 'Q' | 'K' | 'P' | 'N' | 'R' | 'B';
export type Piece<T> = [Player, Rank, Col, Row, T];
export function delay(ms: number = 200) {
	return new Promise<void>((r) => setTimeout(r, ms));
}
