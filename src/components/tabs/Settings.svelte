<script lang="ts">
  import type { Settings } from '$models/Settings';
  import { RadioGroup, RadioItem, RangeSlider, type ModalSettings } from '@skeletonlabs/skeleton';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore();
  const modalSettings: ModalSettings = {
    type: 'component',
    component: 'engineHelp'
  };

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
  <RangeSlider name="depth" bind:value={$settings.depth} min={15} max={20} step={1} ticked>
    <div class="flex justify-between items-center">
      <label class="font-bold" for="depth">Depth</label>
      <p class="text-sm">{$settings.depth} / 20</p>
    </div>
  </RangeSlider>
  <label class="label" for="engine">
    <span class="font-bold flex justify-between">
      Engine
      <button
        class="ml-1 badge-icon variant-filled-surface inline-flex"
        on:click={() => modalStore.trigger(modalSettings)}>?</button
      >
    </span>
    <select name="engine" class="select" bind:value={$settings.engine}>
      <option value="lite-single">Lite single-thread ⚡</option>
      <option value="lite-multi">Lite multi-thread 🚀</option>
      <!-- option value="large-multi">Large multi-thread 🚄</option -->
      <!-- option value="large-single">Large single-thread 🚂</option -->
    </select>
  </label>
</div>
