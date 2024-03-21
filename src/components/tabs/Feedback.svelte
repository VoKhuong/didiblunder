<script lang="ts">
  import Evaluation from '$models/Evaluation';
  import EvaluationIcon from '../EvaluationIcon.svelte';

  export let san: string;
  export let evaluation: Evaluation;
</script>

<div class="flex text-xl items-center">
  <EvaluationIcon {evaluation} />
  {san}
</div>
