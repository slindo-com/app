<script>
	import { routerStore } from '../stores/router-store.js'
	import { teamStore, membersStore } from '../stores/team-store.js'
	
	import UiButton from '../ui/ui-button.svelte'
	import UiViewSection from '../ui/ui-view-section.svelte'
	import UiDetailSection from '../ui/ui-detail-section.svelte'
	import TeamDetails from '../settings/team-details.svelte'

</script>


<UiViewSection>
		
	<header class="border-horizontal border-bottom">
		<h3>
			Settings · Team
		</h3>

		<div class="button-wrapper">
			<UiButton
				label="Invite Member"
				on:click={e => console.log('NEW TEAM MEMBER')} />
		</div>
	</header>

	{#if $teamStore.active}
		{#each $teamStore.active.users as user}
			<a
				href="/{$routerStore.team}/{$routerStore.view}/{$routerStore.project}/{$routerStore.subview}/{user.id}/"
				class="entry border-bottom">
				{$membersStore[user.id] 
					? $membersStore[user.id].firstname +' '+ $membersStore[user.id].lastname 
					: 'Without Name'}
			</a>
		{/each}
	{/if}

</UiViewSection>
<UiDetailSection>
	<TeamDetails />
</UiDetailSection>

<style>

	header {
		margin:18px 36px 0 36px;
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
		margin:0 36px;
		line-height: 48px;
		font-size:14px;
		color:var(--c-font);
		white-space: nowrap;
		overflow:hidden;
		text-overflow: ellipsis;
		min-height:48px;
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