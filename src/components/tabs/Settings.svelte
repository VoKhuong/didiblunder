<script lang="ts">
  import type { Settings } from '$models/Settings';
  import { SegmentedControl, Slider } from '@skeletonlabs/skeleton-svelte';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import EngineHelp from './modals/EngineHelp.svelte';

  const settings: Writable<Settings> = getContext('settings');
</script>

<div class="w-full space-y-4">
  <div class="flex justify-between items-center">
    <label class="font-bold text-left" for="orientation">Orientation</label>
    <SegmentedControl
      name="orientation"
      value={$settings.orientation}
      onValueChange={(details) =>
        settings.update((s) => ({ ...s, orientation: details.value as 'w' | 'b' }))}
    >
      <SegmentedControl.Control>
        <SegmentedControl.Indicator />
        <SegmentedControl.Item value="w">
          <SegmentedControl.ItemText>White</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="b">
          <SegmentedControl.ItemText>Black</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
      </SegmentedControl.Control>
    </SegmentedControl>
  </div>
  <Slider
    name="depth"
    value={[$settings.depth]}
    onValueChange={(details) => settings.update((s) => ({ ...s, depth: details.value[0] }))}
    min={15}
    max={20}
    step={1}
  >
    <div class="flex justify-between items-center">
      <Slider.Label class="font-bold">Depth</Slider.Label>
      <p class="text-sm">{$settings.depth} / 20</p>
    </div>
    <Slider.Control>
      <Slider.Track>
        <Slider.Range />
      </Slider.Track>
      <Slider.Thumb index={0}>
        <Slider.HiddenInput />
      </Slider.Thumb>
    </Slider.Control>
  </Slider>
  <label class="label" for="engine">
    <span class="label-text font-bold flex justify-between items-center">
      Engine
      <EngineHelp />
    </span>
    <select name="engine" class="select" bind:value={$settings.engine}>
      <option value="lite-single">Lite single-thread ⚡</option>
      <option value="lite-multi">Lite multi-thread 🚀</option>
      <!-- option value="large-multi">Large multi-thread 🚄</option -->
      <!-- option value="large-single">Large single-thread 🚂</option -->
    </select>
  </label>
</div>
