<script>
	import { routerStore } from '../stores/router-store.js'
	import { teamStore } from '../stores/team-store.js'
	import { projectsStore } from '../stores/projects-store.js'
	import { 
		tasksStore,
		tasksStoreNewTask,
		tasksStoreChangeAttributes } from '../stores/tasks-store.js'

	import UiButton from '../ui/ui-button.svelte'
	import UiViewNav from '../ui/ui-view-nav.svelte'
	import UiViewSection from '../ui/ui-view-section.svelte'
	import UiDetailSection from '../ui/ui-detail-section.svelte'
	import UiDetailTitle from '../ui/ui-detail-title.svelte'
	import UiDetailInput from '../ui/ui-detail-input.svelte'
	import UiDetailEditable from '../ui/ui-detail-editable.svelte'
	import UiDetailSelect from '../ui/ui-detail-select.svelte'
	import UiDetailTags from '../ui/ui-detail-tags.svelte'
	import UiDetailDate from '../ui/ui-detail-date.svelte'


	const LINKS = [{
		title: 'My Tasks',
		slug: '-'
	}, {
		title: 'Tasks',
		slug: 'tasks'
	}]

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

	$: responsibleOptions = $teamStore.active 
		? $teamStore.active.users.map(user => new Object({
				id: user.id,
				title: user.title.length > 0 ? user.title : 'Without Name'
			}))
		: []

</script>

<UiViewNav links={LINKS} />

	<UiViewSection narrow>
		
		<header class="border-horizontal border-bottom">
			<h3>
				Tasks
			</h3>

			<div class="button-wrapper">
				<UiButton
					label="New Task"
					on:click={e => tasksStoreNewTask($projectsStore.active ? $projectsStore.active.id : null)} />
			</div>
		</header>

		{#each $tasksStore.tasks as task}
			<a
				href="/{$routerStore.team}/{$routerStore.view}/{$routerStore.project}/{$routerStore.subview}/{task.id}/"
				class="entry border-bottom">
				
				<strong>
					SLI-1
				</strong>

				{task.title ? task.title : 'No task summary'}
			</a>
		{/each}

	</UiViewSection>
	<UiDetailSection wide>

		{#if $tasksStore.detailTask}
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
					<div class="input-wrapper">
						Comments
					</div>
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
							empty="No one responsible"
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
		{/if}
	</UiDetailSection>

<style>

	header {
		margin:36px 36px 0 36px;
		padding:0 0 18px 0;
		display:flex;
		flex:row wrap;
	}

	h3 {
		margin:0;
		line-height:48px;
		flex:1;
	}

	.button-wrapper {

	}

	.entry {
		display:block;
		margin:0 36px;
		line-height: 48px;
		font-size:14px;
		color:var(--c-font);
		white-space: nowrap;
		overflow:hidden;
		text-overflow: ellipsis;
	}

	.entry:hover {
		text-decoration: none;
		background:#FAFAFA;
	}

	.entry strong {
		display:inline-block;
		margin-right: 6px;
	}


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
</style>