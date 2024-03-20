import type { Move as ChessMove } from 'chess.js';

export type Move = ChessMove & {index: number};