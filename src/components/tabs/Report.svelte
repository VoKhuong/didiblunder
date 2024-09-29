<script lang="ts">
  import { getMoveNumber, toTableSource } from '$lib/table';
  import { Table, type TableSource } from '@skeletonlabs/skeleton';
  import type { Move } from 'chess.js';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import Feedback from './Feedback.svelte';
  import type { Evaluation } from '$models/Evaluation';
  import { formatScore } from '$lib/evaluation';

  const history: Writable<Move[]> = getContext('history');
  const move: Writable<number> = getContext('move');
  const position: Writable<string> = getContext('position');
  const evaluation: Writable<Evaluation> = getContext('evaluation');

  let data: TableSource = toTableSource($history);
  let san: string = $history[$move]?.san;

  let score: string;

  const onSelected = (meta: CustomEvent) => {
    move.set(getMoveNumber(meta.detail[0]));
    position.set($history[$move].after);
  };

  $: san = $history[$move]?.san;
  $: score = formatScore($evaluation);
</script>

<div class="h-28 md:h-32 lg:h-56 mb-2 overflow-y-auto">
  <Table source={data} interactive on:selected={onSelected} />
</div>
<Feedback {san} {score} label={$evaluation.label} />
