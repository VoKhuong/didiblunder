import type { TableSource } from '@skeletonlabs/skeleton';
import type { Move } from 'chess.js';

export function toTableSource(history: Move[]): TableSource {
  const source: TableSource = {
    head: [],
    body: []
  };

  for (let i = 0, index = 0; i < history.length; i++) {
    index = Math.floor(i / 2);
    if (i % 2 === 0) {
      source.body.push([`${index + 1}.`, history[i].san]);
    } else {
      source.body[index].push(history[i].san);
    }
  }

  return source;
}

export function getMoveNumber(tabIndex: string) {
  return (parseInt(tabIndex.substring(0, tabIndex.length - 1)) - 1) * 2;
}
