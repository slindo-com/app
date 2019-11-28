<script>
	import { onMount } from 'svelte'
	import { get } from 'svelte/store'
	import { routerStore } from '../stores/router-store.js'
	import { teamStore, membersStore, teamStoreGetUser, teamStoreUpdateUser } from '../stores/team-store.js'
	import { projectsStore } from '../stores/projects-store.js'
	
	import UiDetailInput from '../ui/ui-detail-input.svelte'


	let data = {
		firstname: '',
		lastname: ''
	}

	onMount(() => {
		membersStore.subscribe(membersData => {
			const { detail } = get(routerStore)

			data = membersData[detail] || {
				firstname: '',
				lastname: ''
			}
		})
	})


</script>


<div class="detail-wrapper">
	<div class="input-wrapper">
		<UiDetailInput
			label="First Name"
			type="text"
			bind:value={data.firstname}
			on:save={e => teamStoreUpdateUser($routerStore.detail, data)} />
	</div>
	<div class="input-wrapper">
		<UiDetailInput
			label="Last Name"
			type="text"
			bind:value={data.lastname}
			on:save={e => teamStoreUpdateUser($routerStore.detail, data)} />
	</div>
</div>



<style>
	.detail-wrapper {
		padding:36px;
	}

	.input-wrapper {
		margin-bottom:18px;
	}
</style>