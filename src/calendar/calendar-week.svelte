<script>
	import { onMount, beforeUpdate, afterUpdate } from 'svelte'
	import { get } from 'svelte/store'
	import { routerStore } from '../stores/router-store.js'
	import { 
		datePrevDate,
		dateNextDate,
		dateGetWeek,
		dateToDatabaseDate } from '../helpers/helpers.js'

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
<div class="wrapper border-bottom" style="--weekHeight:{weekHeight}px;--top:{weekHeight * weekId}px">
	{#each days as day}
		<a href="/{$routerStore.project}/{$routerStore.view}/{$routerStore.subview}/{dateToDatabaseDate(day)}/" class="day border-vertical">
			{day.getDate()}
		</a>
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
		display:flex;
		flex:row;
	}

	.day {
		min-width: calc(100% / 7);
		max-width: calc(100% / 7);
		padding:12px;
		font-size:11.5px;
		cursor:pointer;
		color:var(--color-font);
	}

	.day:first-child:after {
		display:none;
	}

	.day:hover {
		background:#FAFAFA;
		text-decoration: none;
	}


</style>