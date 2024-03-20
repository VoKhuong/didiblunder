<script lang="ts">
  import { toTableSource } from "$lib/table";
  import { Table, type TableSource } from "@skeletonlabs/skeleton";
  import type { Move } from "chess.js";
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";

  let data: TableSource = {
    head: [],
    body: []
  };

  const history: Writable<Move[]> = getContext('history');

  history.subscribe(x => data = toTableSource(x));
</script>

<div class="h-28 md:h-32 lg:h-56 overflow-y-auto">
  <Table source={data} interactive />
</div>