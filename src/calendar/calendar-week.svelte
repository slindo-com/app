<script>
	import { onMount, beforeUpdate, afterUpdate } from 'svelte'
	import { get } from 'svelte/store'
	import { 
		datePrevDate,
		dateNextDate,
		dateGetWeek } from '../helpers/helpers.js'

	export let weekBase
	export let weekHeight
	export let weekId

	let days = []

	onMount(() => {
		const firstWeekDay = datePrevDate(weekBase, (5000 - weekId) * 7)

		for(var i = 0; i < 7; i++) {
			days.push(dateNextDate(firstWeekDay, i))
		}

		days = days
	})

</script>
<div class="wrapper" style="--weekHeight:{weekHeight}px;--top:{weekHeight * weekId}px">
	{#each days as day}
		<div class="day">
			{day.getDate()}
		</div>
	{/each}
</div>

<style>

	.wrapper {
		position: absolute;
		top:var(--top);
		left:12px;
		width:calc(100% - 24px);
		height:var(--dayElHeight);
		scroll-snap-align: start;
		border-bottom:#EEE 1px solid;
		display:flex;
		flex:row;
	}

	.day {
		min-width: calc(100% / 7);
		max-width: calc(100% / 7);
		padding:12px;
		border-right:#EEE 1px solid;
		font-size:11.5px;
	}

	.day:last-child {
		border:0;
	}


</style>