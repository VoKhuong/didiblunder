import type { Move } from 'chess.js';

export function toTableRows(history: Move[]): string[][] {
  const rows: string[][] = [];

  for (let i = 0, index = 0; i < history.length; i++) {
    index = Math.floor(i / 2);
    if (i % 2 === 0) {
      rows.push([`${index + 1}.`, history[i].san]);
    } else {
      rows[index].push(history[i].san);
    }
  }

  return rows;
}
