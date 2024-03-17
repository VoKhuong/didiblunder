<script lang="ts">
  import Chessboard from "../components/Chessboard.svelte";
  import Panel from "../components/Panel.svelte";
</script>
<div class="flex flex-wrap justify-center my-6">
  <div class="size-4/5 md:size-1/2">
    <Chessboard />
  </div>
  <div class="w-4/5 md:w-1/4 mt-4 md:ml-6 md:mt-0">
    <Panel />
  </div>
</div>
