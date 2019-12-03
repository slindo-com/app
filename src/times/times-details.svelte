<script>
	import { onMount } from 'svelte'
	import { get } from 'svelte/store'
	import { dateToDatabaseDate, datePrevDate, dateGetHours, dateGetMinutes, dateGetSeconds, dateTimeToDuration } from '../helpers/helpers.js'
	import { routerStore } from '../stores/router-store.js'
	import { teamStore, membersStore, teamStoreGetUsername } from '../stores/team-store.js'
	import { projectsStore } from '../stores/projects-store.js'
	//import { tasksStore } from '../stores/tasks-store.js'
	import { 
		timesStore,
		timesStoreChangeAttributes } from '../stores/times-store.js'
	
	import UiDetailTitle from '../ui/ui-detail-title.svelte'
	import UiDetailInput from '../ui/ui-detail-input.svelte'
	import UiDetailSelect from '../ui/ui-detail-select.svelte'


	let taskOptions = [{
		id: null,
		title: 'No Task'
	}, {
		id: 1,
		title: 'TEST'
	}, {
		id: 2,
		title: 'TEST 2'
	}]


	onMount(() => {
		const timesData = get(timesStore)
	})

	function saveComment() {
		const comment = commentEl.get(),
			timesData = get(timesStore)
	}
</script>



<div class="detail-wrapper">

		<div class="input-wrapper">
			<UiDetailInput
				label="Duration"
				type="text"
				value={dateGetHours($timesStore.detailTime.duration) +':'+ dateGetMinutes($timesStore.detailTime.duration)}
				on:save={e => timesStoreChangeAttributes($timesStore.detailTime.id, { duration: dateTimeToDuration(e.detail) })} />
		</div>

		<div class="input-wrapper">
			<UiDetailSelect
				label="Task"
				empty="No Task"
				bind:value={$timesStore.detailTime.task}
				options={taskOptions}
				on:save={e => timesStoreChangeAttributes($timesStore.detailTime.id, { task: e.detail })} />
		</div>


		<div class="input-wrapper">
			<UiDetailTitle
				bind:value={$timesStore.detailTime.comment}
				on:save={e => timesStoreChangeAttributes($timesStore.detailTime.id, { comment: e.detail })} />
		</div>


		<!--<div class="input-wrapper">
			<UiDetailInput
				label="Tracked by"
				type="text"
				value={teamStoreGetUsername($timesStore.detailTime.user, $membersStore)}
				transparent
				disabled />
		</div>-->


		<!-- {JSON.stringify($timesStore.detailTime)} s-->

</div>



<style>
	.detail-wrapper {
		padding:36px;
	}

	.input-wrapper {
		margin-bottom:18px;
	}
</style>