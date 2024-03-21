<script lang="ts">
  import { getMoveNumber, toTableSource } from "$lib/table";
  import { Table, type TableSource } from "@skeletonlabs/skeleton";
  import type { Move } from "chess.js";
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";

  const history: Writable<Move[]> = getContext('history');
  const move: Writable<number> = getContext('move');
  const position: Writable<string> = getContext('position');

  let data: TableSource = toTableSource($history);

  const onSelected = (meta: CustomEvent) => {
    const index = getMoveNumber(meta.detail[0])
    position.set($history[index].after);
    move.set(index + 1);
  };
</script>

<div class="h-28 md:h-32 lg:h-56 overflow-y-auto">
  <Table source={data} interactive on:selected={onSelected} />
</div>