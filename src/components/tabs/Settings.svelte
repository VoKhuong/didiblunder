<script lang="ts">
  import type { Settings } from '$models/Settings';
  import { RadioGroup, RadioItem, RangeSlider } from '@skeletonlabs/skeleton';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';

  const settings: Writable<Settings> = getContext('settings');
</script>

<div class="w-full space-y-4">
  <div class="flex justify-between items-center">
    <label class="font-bold text-left" for="orientation">Orientation</label>
    <RadioGroup>
      <RadioItem bind:group={$settings.orientation} name="orientation" value="w">White</RadioItem>
      <RadioItem bind:group={$settings.orientation} name="orientation" value="b">Black</RadioItem>
    </RadioGroup>
  </div>
  <RangeSlider name="depth" bind:value={$settings.depth} min={10} max={25} step={1} ticked>
    <div class="flex justify-between items-center">
      <label class="font-bold" for="depth">Depth</label>
      <p class="text-sm">{$settings.depth} / 25</p>
    </div>
  </RangeSlider>
</div>