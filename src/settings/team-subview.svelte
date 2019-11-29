<script>
	import { fade } from 'svelte/transition'
	import { routerStore } from '../stores/router-store.js'
	import { teamStore, membersStore, teamStoreInvite, teamStoreGetUsername } from '../stores/team-store.js'
	
	import UiInput from '../ui/ui-input.svelte'
	import UiButton from '../ui/ui-button.svelte'
	import UiViewSection from '../ui/ui-view-section.svelte'
	import UiDetailSection from '../ui/ui-detail-section.svelte'
	import TeamDetails from '../settings/team-details.svelte'

	let overlayOpen = false,
		overlayEl,
		newEmail,
		newEmailError,
		showInvitations = false


	function open() {
		overlayOpen = true
		setTimeout(() => {
			overlayEl.querySelector('input').focus()
		})
	}


	function keydown(e) {
		if(e.keyCode === 13) {
			invite(e)
		}
	}

	function invite(e) {
		e.preventDefault()

		teamStoreInvite(newEmail)
		overlayOpen = false
	}

</script>


<UiViewSection>
		
	<header class="border-horizontal border-bottom">
		<h3>
			Settings · Team
		</h3>

		<div class="button-wrapper">
			<UiButton
				label="Invite Member"
				on:click={e => open()} />

			{#if overlayOpen}
				<div
					class="overlay"
					transition:fade="{{ duration: 100 }}"
					bind:this={overlayEl}>
					<h3>
						Invite Member
					</h3>
					<p>
						Please provide an email address of the new member. We'll send an invitation to her/him. 
					</p>


					<form on:keydown={e => keydown(e)}>

						<div class="form-item">
							<UiInput
								label="E-Mail"
								type="email"
								bind:value={newEmail}
								bind:error={newEmailError} />
						</div>
						
						<UiButton label="Send Invitation" on:click={e => invite(e)} />
					</form>

				</div>
				<div
					class="shadow"
					transition:fade="{{ duration: 100 }}"
					on:click={e => overlayOpen = false}></div>
			{/if}
		</div>
	</header>

	{#if $teamStore.active}
		{#each $teamStore.active.users as user}
			<a
				href="/{$routerStore.project}/{$routerStore.view}/{$routerStore.subview}/{user.id}/"
				class="entry border-bottom">
				{teamStoreGetUsername(user.id, $membersStore)}
			</a>
		{/each}

		{#if $teamStore.active.invitations.length > 0}
			{#if !showInvitations}
				<header>
					<a on:click|preventDefault={e => showInvitations = true}>
						Show Invitations ({$teamStore.active.invitations.length})
					</a>
				</header>
			{:else}
				<header class="border-horizontal border-bottom">
					<h3>
						Invitations
					</h3>
				</header>
			{/if}

			{#if showInvitations}
				{#each $teamStore.active.invitations as user}
					<div class="entry border-bottom">
						{user.email}
					</div>
				{/each}
			{/if}
		{/if}



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

	header a {
		cursor:pointer;
		text-decoration: underline;
	}

	header a:hover {
		text-decoration: none;
	}

	h3 {
		margin:0;
		line-height:42px;
		flex:1;
	}

	.button-wrapper {
		position: relative;
	}

	.overlay {
		position: absolute;
		top:0;
		right:0;
		background:#FFF;
		border-radius: var(--border-radius);
		box-shadow: var(--shadow-overlay);
		padding:12px 24px 24px 24px;
		z-index:1010;
		width:360px;
	}

	.shadow {
		position: fixed;
		top:0;
		left:0;
		width:100%;
		height:100%;
		background:rgba(0, 0, 0, .15);
		z-index:1000;
	}

	.form-item {
		margin:24px 0;
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

	a.entry:hover {
		text-decoration: none;
		background:#FAFAFA;
	}

	.entry strong {
		display:inline-block;
		margin-right: 6px;
	}

</style>