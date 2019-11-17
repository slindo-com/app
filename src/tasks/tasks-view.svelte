<script>
	import { routerStore } from '../stores/router-store.js'
	import { projectsStore } from '../stores/projects-store.js'
	import { 
		tasksStore,
		tasksStoreNewTask,
		tasksStoreChangeTitle,
		tasksStoreChangeDescription,
		tasksStoreChangeStatus,
		tasksStoreChangePriority } from '../stores/tasks-store.js'

	import UiButton from '../ui/ui-button.svelte'
	import UiViewNav from '../ui/ui-view-nav.svelte'
	import UiViewSection from '../ui/ui-view-section.svelte'
	import UiDetailSection from '../ui/ui-detail-section.svelte'
	import UiDetailInput from '../ui/ui-detail-input.svelte'
	import UiDetailEditable from '../ui/ui-detail-editable.svelte'
	import UiDetailSelect from '../ui/ui-detail-select.svelte'


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
				{task.title ? task.title : 'No task summary'}
			</a>
		{/each}

	</UiViewSection>
	<UiDetailSection wide>

		{#if $tasksStore.detailTask}
			<div class="detail-wrapper">
				<section class="left">
					<div class="input-wrapper">
						<UiDetailInput
							label="Summary"
							type="text"
							value={$tasksStore.detailTask.title}
							on:save={e => tasksStoreChangeTitle($tasksStore.detailTask.id, e.detail)}
							transparent />
					</div>
					<div class="input-wrapper">
						<UiDetailEditable
							label=""
							placeholder="No description given. Click here to add one."
							type="text"
							value={$tasksStore.detailTask.description}
							on:save={e => tasksStoreChangeDescription($tasksStore.detailTask.id, e.detail)}
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
							type="text"
							bind:value={$tasksStore.detailTask.status}
							options={statusOptions}
							on:save={e => tasksStoreChangeStatus($tasksStore.detailTask.id, e.detail)} />
					</div>


					<div class="input-wrapper">
						<UiDetailInput
							label="Responsible"
							type="text"
							value="Benjamin Kowalski" />
					</div>


					<div class="input-wrapper">
						<UiDetailInput
							label="Reporter"
							type="text"
							value="Benjamin Kowalski" />
					</div>


					<div class="input-wrapper">
						<UiDetailInput
							label="Labels"
							type="text"
							value="Arbeit, Nervt" />
					</div>


					<div class="input-wrapper">
						<UiDetailSelect
							label="Priority"
							type="text"
							bind:value={$tasksStore.detailTask.priority}
							options={priorityOptions}
							on:save={e => tasksStoreChangePriority($tasksStore.detailTask.id, e.detail)} />
					</div>


					<div class="input-wrapper">
						<UiDetailInput
							label="Due Date"
							type="text"
							value="No Due Date" />
					</div>


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
		line-height: 42px;
		font-size:14px;
		color:var(--c-font);
	}

	.entry:hover {
		text-decoration: none;
		background:#FAFAFA;
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
</style>