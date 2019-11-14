<script>
	import { 
		projectsStore, 
		projectsStoreNewProject,
		projectsStoreChangeTitle,
		projectsStoreChangeCode } from '../stores/projects-store.js'
	import UiButton from '../ui/ui-button.svelte'


	function submit(e, id) {
		e.preventDefault();
		const title = e.srcElement[0].value
		const code = e.srcElement[1].value

		projectsStoreChangeTitle(id, title)
		setTimeout(() => {
			projectsStoreChangeCode(id, code)
		})
	}
</script>


Projects

<UiButton
	label="New Project"
	on:click={e => projectsStoreNewProject()} />

{#each $projectsStore.projects as project}
	<form on:submit={e => submit(e, project.id)}>
		<input type="text" bind:value={project.title}>
		<input type="text" bind:value={project.code}>
		<button>
			Submit
		</button>
	</form>
{/each}



<style>

</style>