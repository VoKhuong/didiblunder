<script lang="ts">
  import { SegmentedControl, Slider } from '@skeletonlabs/skeleton-svelte';
  import EngineHelp from './modals/EngineHelp.svelte';
  import { getGame } from '$lib/game-context';
  import { ENGINES, type EngineId } from '$lib/engines';

  const game = getGame();

  const engines = Object.entries(ENGINES)
    .filter(([, engine]) => engine.selectable)
    .map(([id, engine]) => ({ id: id as EngineId, label: engine.label }));
</script>

<div class="w-full space-y-4">
  <SegmentedControl
    name="theme"
    class="flex flex-row items-center justify-between {game.isAnalyzing ? 'disabled' : ''}"
    disabled={game.isAnalyzing}
    value={game.settings.theme}
    onValueChange={(details) => (game.settings.theme = details.value as 'light' | 'dark')}
  >
    <SegmentedControl.Label class="font-bold">Theme</SegmentedControl.Label>
    <SegmentedControl.Control>
      <SegmentedControl.Indicator />
      <SegmentedControl.Item value="light">
        <SegmentedControl.ItemText aria-label="Light mode">☀️</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
      <SegmentedControl.Item value="dark">
        <SegmentedControl.ItemText aria-label="Dark mode">🌙</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
    </SegmentedControl.Control>
  </SegmentedControl>
  <SegmentedControl
    name="orientation"
    class="flex flex-row items-center justify-between {game.isAnalyzing ? 'disabled' : ''}"
    disabled={game.isAnalyzing}
    value={game.settings.orientation}
    onValueChange={(details) => (game.settings.orientation = details.value as 'w' | 'b')}
  >
    <SegmentedControl.Label class="font-bold">Orientation</SegmentedControl.Label>
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
  <Slider
    name="depth"
    class={game.isAnalyzing ? 'disabled' : ''}
    disabled={game.isAnalyzing}
    value={[game.settings.depth]}
    onValueChange={(details) => (game.settings.depth = details.value[0])}
    min={15}
    max={20}
    step={1}
  >
    <div class="flex justify-between items-center">
      <Slider.Label class="font-bold">Depth</Slider.Label>
      <p class="text-sm">{game.settings.depth} / 20</p>
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
    <select
      name="engine"
      class="select"
      bind:value={game.settings.engine}
      disabled={game.isAnalyzing}
    >
      {#each engines as engine}
        <option value={engine.id}>{engine.label}</option>
      {/each}
    </select>
  </label>
</div>
