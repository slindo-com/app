<script>
	import { routerStore } from '../stores/router-store.js'
	import { projectsStore } from '../stores/projects-store.js'
	import { tasksStore, tasksStoreNewTask } from '../stores/tasks-store.js'

	import UiButton from '../ui/ui-button.svelte'
	import UiViewNav from '../ui/ui-view-nav.svelte'
	import UiViewSection from '../ui/ui-view-section.svelte'
	import UiDetailSection from '../ui/ui-detail-section.svelte'


	const LINKS = [{
		title: 'My Tasks',
		slug: '-'
	}, {
		title: 'Tasks',
		slug: 'tasks'
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
				Task
			</a>
		{/each}

	</UiViewSection>
	<UiDetailSection wide>
		Detail
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
</style>