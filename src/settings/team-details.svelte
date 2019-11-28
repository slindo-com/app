<script>
	import { onMount } from 'svelte'
	import { get } from 'svelte/store'
	import { routerStore } from '../stores/router-store.js'
	import { teamStore, teamStoreGetUser, teamStoreUpdateUser } from '../stores/team-store.js'
	import { projectsStore } from '../stores/projects-store.js'
	
	import UiDetailInput from '../ui/ui-detail-input.svelte'


	$: data = teamStoreGetUser($routerStore.detail, $teamStore)

	onMount(() => {
		
	})


</script>


{#if data}
	<div class="detail-wrapper">
		<div class="input-wrapper">
			<UiDetailInput
				label="Name"
				type="text"
				bind:value={data.title}
				on:save={e => teamStoreUpdateUser(data.id, data.title)} />
		</div>
	</div>
{/if}


<style>
	.detail-wrapper {
		padding:36px;
	}

	.input-wrapper {
		margin-bottom:18px;
	}
</style>