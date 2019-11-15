<script>
	import { routerStore } from '../stores/router-store.js'
	import { projectsStore } from '../stores/projects-store.js'
	import { tasksStore, tasksStoreNewTask, tasksStoreChangeTitle } from '../stores/tasks-store.js'

	import UiButton from '../ui/ui-button.svelte'
	import UiViewNav from '../ui/ui-view-nav.svelte'
	import UiViewSection from '../ui/ui-view-section.svelte'
	import UiDetailSection from '../ui/ui-detail-section.svelte'
	import UiDetailInput from '../ui/ui-detail-input.svelte'


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
				{task.title ? task.title : 'No task summary'}
			</a>
		{/each}

	</UiViewSection>
	<UiDetailSection wide>

		{#if $tasksStore.detailTask}
			<div class="padding">
			<form on:submit|preventDefault={e => tasksStoreChangeTitle($tasksStore.detailTask.id, e.srcElement[0].value)}>
				
				<div class="input-wrapper">
					<UiDetailInput
						label="Summary"
						type="text"
						value={$tasksStore.detailTask.title}
						error=""
						transparent
					/>
				</div>
				<div class="input-wrapper">
					<UiDetailInput
						label="Description"
						type="text"
						value={$tasksStore.detailTask.description}
						error=""
					/>
				</div>
			</form>
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

	.padding {
		padding:36px;
	}

	.input-wrapper {
		margin-bottom:18px;
	}
</style>