<script>
	import { onMount, beforeUpdate, afterUpdate } from 'svelte'
	import { get } from 'svelte/store'
	import { routerStore } from '../stores/router-store.js'
	import { teamStore } from '../stores/team-store.js'
	import { projectsStore } from '../stores/projects-store.js'
	import { 
		messagesStore,
		messagesStoreObserveNewDay,
		messagesStoreNewMessage } from '../stores/messages-store.js'
	import { 
		datePrevDate,
		dateGetWeek } from '../helpers/helpers.js'

	import UiViewSection from '../ui/ui-view-section.svelte'
	import UiDetailSection from '../ui/ui-detail-section.svelte'
	import CalendarWeek from '../calendar/calendar-week.svelte'


	let testEl,
		dayElHeight = 0,
		weekBase = getFirstWeekdayDate(getFirstDayDate(new Date())),
		currentDayEl = 5000,
		dayEls = []

	onMount(() => {
		window.requestAnimationFrame(() => {
			dayElHeight = testEl.getBoundingClientRect().height / 6
			currentDayEl = 5000
			createDayEls(currentDayEl)
			window.requestAnimationFrame(() => {
				testEl.scrollTop = currentDayEl * dayElHeight
			})
		})
	})


	function resize() {
		dayElHeight = testEl.getBoundingClientRect().height / 6
		window.requestAnimationFrame(() => {
			testEl.scrollTop = currentDayEl * dayElHeight
		})
	}


	function getFirstDayDate(date) {
		while(datePrevDate(date).getMonth() === date.getMonth()) {
			date = datePrevDate(date)
		}
		return date
	}

	function getFirstWeekdayDate(date) {
		let day = date.getDay(),
			diff = date.getDate() - day + (day == 0 ? -6 : 1)
		return new Date(date.setDate(diff))
	}


	function scroll(e) {
		const newCurrentDayEl = Math.floor(testEl.scrollTop / dayElHeight)

		if(newCurrentDayEl != currentDayEl) {
			currentDayEl = newCurrentDayEl

			createDayEls(currentDayEl)
		}
	}

	function createDayEls(currentDayElTmp) {

		let tmp = [],
		tmp2 = []

		tmp.push(currentDayElTmp - 200)
		tmp.push(currentDayElTmp - 100)
		tmp.push(currentDayElTmp - 50)

		for(let i = currentDayElTmp - 10; i <= currentDayElTmp + 10; i++) {
			tmp.push(i)
		}

		tmp.push(currentDayElTmp + 50)
		tmp.push(currentDayElTmp + 100)
		tmp.push(currentDayElTmp + 200)

		dayEls = tmp
	}


</script>
<UiViewSection nonav>
	<header>
		<h3>
			December, 2019
		</h3>
	</header>
	<div class="wrapper" style="--dayElHeight:{dayElHeight}px">
		<div
			class="test"
			bind:this={testEl}
			on:scroll={e => scroll(e)}>
			<div class="inner">
				{#each dayEls as weekId, index (weekId)}
					<CalendarWeek
						weekBase={weekBase}
						weekHeight={dayElHeight}
						weekId={weekId} />
				{/each}
			</div>
		</div>
	</div>
</UiViewSection>
<UiDetailSection nonav>
	Detail
</UiDetailSection>

<svelte:window on:resize={e => resize()} />

<style>

	header {
		height:78px;
	}

	h3 {
		padding:27px 0;
		margin:0 0 0 24px;
	}

	.wrapper {
		position: relative;
		height:calc(100% - 78px);
		display: flex;
		flex-direction:column;
		transform:translate3d(0, 0, 0);
		overflow: hidden;
	}

	.test {
		position: relative;
		width:100%;
		height:100%;
		overflow-x: hidden;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch; 
		z-index:200;
		scroll-snap-type: y mandatory;
	}

	.test::-webkit-scrollbar {
		display: none;
	}

	.inner {
		height:calc(var(--dayElHeight) * 10000);
	}

</style>