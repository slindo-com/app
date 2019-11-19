<script>
	import { routerStore } from '../stores/router-store.js'
	import { teamStore } from '../stores/team-store.js'
	import { projectsStore } from '../stores/projects-store.js'
	import { 
		tasksStore,
		tasksStoreNewTask,
		tasksStoreChangeAttributes } from '../stores/tasks-store.js'

	import UiButton from '../ui/ui-button.svelte'
	import UiDetailTitle from '../ui/ui-detail-title.svelte'
	import UiDetailInput from '../ui/ui-detail-input.svelte'
	import UiDetailEditable from '../ui/ui-detail-editable.svelte'
	import UiDetailSelect from '../ui/ui-detail-select.svelte'
	import UiDetailTags from '../ui/ui-detail-tags.svelte'
	import UiDetailDate from '../ui/ui-detail-date.svelte'



	const statusOptions = [{
		title: 'In Progress',
		id: '1'
	}, {
		title: 'Done',
		id: '2'
	}]

	const priorityOptions = [{
		title: 'Low',
		id: '0'
	}, {
		title: 'Normal',
		id: '1'
	}, {
		title: 'High',
		id: '2'
	}]

	$: responsibleTeamOptions = $teamStore.active 
		? $teamStore.active.users.map(user => new Object({
				id: user.id,
				title: user.title.length > 0 ? user.title : 'Without Name'
			}))
		: []
	$: responsibleOptions = ([{
			id: null,
			title: 'No One'
		}]).concat(responsibleTeamOptions)
</script>



<div class="detail-wrapper">
	<section class="left">
		<div class="input-wrapper wide-input-wrapper">
			<UiDetailTitle
				bind:value={$tasksStore.detailTask.title}
				on:save={e => tasksStoreChangeAttributes($tasksStore.detailTask.id, { title: e.detail })}
				transparent />
		</div>
		<div class="input-wrapper wide-input-wrapper">
			<UiDetailEditable
				label=""
				placeholder="No description given. Click here to add one."
				type="text"
				bind:value={$tasksStore.detailTask.description}
				on:save={e => tasksStoreChangeAttributes($tasksStore.detailTask.id, { description: e.detail })}
				transparent />
		</div>

		<hr />

	</section>
	<section class="right">


		<div class="input-wrapper">
			<UiDetailSelect
				label="Status"
				empty="No status selected"
				bind:value={$tasksStore.detailTask.status}
				options={statusOptions}
				on:save={e => tasksStoreChangeAttributes($tasksStore.detailTask.id, { status: e.detail })} />
		</div>


		<div class="input-wrapper">
			<UiDetailSelect
				label="Responsible"
				empty="No One"
				bind:value={$tasksStore.detailTask.responsible}
				options={responsibleOptions}
				on:save={e => tasksStoreChangeAttributes($tasksStore.detailTask.id, { responsible: e.detail })} />
		</div>


		<div class="input-wrapper">
			<UiDetailTags
				label="Labels"
				type="text"
				bind:value={$tasksStore.detailTask.labels}
				on:save={e => tasksStoreChangeAttributes($tasksStore.detailTask.id, { labels: e.detail })}/>
		</div>


		<div class="input-wrapper">
			<UiDetailSelect
				label="Priority"
				empty="Normal"
				bind:value={$tasksStore.detailTask.priority}
				options={priorityOptions}
				on:save={e => tasksStoreChangeAttributes($tasksStore.detailTask.id, { priority: e.detail })} />
		</div>

		<div class="input-wrapper">
			<UiDetailDate
				label="Due Date"
				bind:value={$tasksStore.detailTask.due}
				on:save={e => tasksStoreChangeAttributes($tasksStore.detailTask.id, { due: e.detail })} />
		</div>

		<div class="input-wrapper">
			<UiDetailInput
				label="Reporter"
				type="text"
				value="Benjamin Kowalski"
				transparent
				disabled />
		</div>


		<!-- {JSON.stringify($tasksStore.detailTask)} -->


	</section>
</div>



<style>
	.detail-wrapper {
		display:flex;
		flex:row wrap;
	}

	section {
		padding:36px;
	}

	.left {
		padding-right:18px;
		width:612px;
	}

	.right {
		min-width:340px;
		max-width:340px;
		padding-left:18px;
	}

	.input-wrapper {
		margin-bottom:18px;
	}

	.wide-input-wrapper {
		margin:0 -18px;
	}

	hr {
		margin:30px 0 0 0;
		border:0;
		height:1px;
		border:#CCC 1px solid;
		transform:scale(1, .5);
	}
</style>