<script lang="ts">
  import { RadioGroup, RadioItem, RangeSlider } from '@skeletonlabs/skeleton';

  let value: number = 0;
  let slider: number = 15;
</script>

<div class="w-full space-y-4">
  <div class="flex justify-between items-center">
    <label class="font-bold text-left" for="justify">Orientation</label>
    <RadioGroup>
      <RadioItem bind:group={value} name="justify" value={0}>White</RadioItem>
      <RadioItem bind:group={value} name="justify" value={1}>Black</RadioItem>
    </RadioGroup>
  </div>
  <RangeSlider name="range-slider" bind:value={slider} min={10} max={25} step={1} ticked>
    <div class="flex justify-between items-center">
      <div class="font-bold">Depth</div>
      <div class="text-sm">{slider} / 25</div>
    </div>
  </RangeSlider>
</div>