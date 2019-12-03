<script>
	import { onMount } from 'svelte'
	import { dateToDatabaseDate, datePrevDate, dateGetHours, dateGetMinutes, dateGetSeconds } from '../helpers/helpers.js'
	import { routerStore } from '../stores/router-store.js'
	import { teamStore } from '../stores/team-store.js'
	import { projectsStore } from '../stores/projects-store.js'
	import { 
		timesStore,
		timesStoreObserveNewDay,
		timesStoreNewTime,
		timesStoreChangeAttributes } from '../stores/times-store.js'

	import UiButton from '../ui/ui-button.svelte'
	import UiViewNav from '../ui/ui-view-nav.svelte'
	import UiViewSection from '../ui/ui-view-section.svelte'
	import UiDetailSection from '../ui/ui-detail-section.svelte'

	import TimesDay from '../times/times-day.svelte'
	import TimesDetail from '../times/times-details.svelte'

	const LINKS = [{
		title: 'My Times',
		slug: '-'
	}, {
		title: 'Reports',
		slug: 'reports'
	}]

	let dayNow = new Date(),
		days = [dayNow],
		observer,
		oberserveEl,
		shouldObserve = false

	$: isMyTimes = $routerStore.subview === '-'


	onMount(() => {
		timesStoreObserveNewDay(dayNow)
	})


	function moreDates(e) {

		shouldObserve = true

		for(let i = 0; i < 20; i++) {
			dayNow = datePrevDate(dayNow)
			timesStoreObserveNewDay(dayNow)
			days = [...days, dayNow]
		}

		observer = new IntersectionObserver(entries => {
			if (entries[0].intersectionRatio > 0) {
				dayNow = datePrevDate(dayNow)
				timesStoreObserveNewDay(dayNow)
				days = [...days, dayNow]
			}
		}, {
			rootMargin: '240px',
			threshold: 1.0
		})

		observer.observe(oberserveEl)
	}

</script>

<UiViewNav links={LINKS} />

<UiViewSection>
		
	<!--<header class="border-horizontal border-bottom">
		<h3>
			{isMyTimes ? 'My Times' : 'Reports'}
		</h3>

		<div class="button-wrapper">
			<UiButton
				label="New Time"
				on:click={e => timesStoreNewTime($projectsStore.active ? $projectsStore.active.id : null)} />
		</div>
	</header>-->

	{#each days as day}
		<TimesDay day={day} />
	{/each}

	{#if !shouldObserve}
		<a href="#" on:click|preventDefault={e => moreDates(e)}>
			Show more dates
		</a>
	{/if}

	<div bind:this={oberserveEl}></div>


</UiViewSection>
<UiDetailSection>
	{#if $timesStore.detailTime}
		<TimesDetail />
	{/if}
</UiDetailSection>

<style>

	header {
		margin:18px 36px 0 36px;
		padding:0 0 18px 0;
		display:flex;
		flex:row wrap;
	}

	h3 {
		margin:0;
		line-height:42px;
		flex:1;
	}

	a {
		margin:36px;
		display:block;
	}

</style>