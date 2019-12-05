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

	import TasksDetail from '../tasks/tasks-details.svelte'

	const LINKS = [{
		title: 'My Tasks',
		slug: '-'
	}, {
		title: 'Tasks',
		slug: 'tasks'
	}]

	$: isMyTasks = $routerStore.subview === '-'

</script>

<UiViewNav links={LINKS} />

<UiViewSection narrow>
		
	<header class="border-horizontal border-bottom">
		<h3>
			{isMyTasks ? 'My Tasks' : 'Tasks'}
		</h3>

		<div class="button-wrapper">
			<UiButton
				label="New Task"
				on:click={e => tasksStoreNewTask($projectsStore.active ? $projectsStore.active.id : null)} />
		</div>
	</header>

	{#each $tasksStore.tasks as task}
		<a
			href="/{$routerStore.project}/{$routerStore.view}/{$routerStore.subview}/{task.id}/"
			class="entry border-bottom">
				
			<strong>
				SLI-{task.number}
			</strong>

			{task.title ? task.title : 'No task summary'}
		</a>
	{/each}

</UiViewSection>
<UiDetailSection wide>
	{#if $tasksStore.detailTask}
		<TasksDetail />
	{/if}
</UiDetailSection>

<style>

	header {
		margin:18px 24px 0 24px;
		padding:0 0 18px 0;
		display:flex;
		flex:row wrap;
	}

	h3 {
		margin:0;
		line-height:42px;
		flex:1;
	}

	.entry {
		display:block;
		margin:0 24px;
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

</style>