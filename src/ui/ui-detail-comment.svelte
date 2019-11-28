<script>
	import { onMount } from 'svelte'
	import { teamStore, membersStore, teamStoreGetUser } from '../stores/team-store.js'
	import { uiStore } from '../stores/ui-store.js'
	import { toHtml } from '../helpers/markdown.js'

	import UiSince from '../ui/ui-since.svelte'

	
	export let data = {}

	$: user = teamStoreGetUser(data.user)

	onMount(() => {
		
	})

</script>


<div class="wrapper">
	<div class="profile">
	</div>
	<div class="comment">
		<header>
			<strong>
				{user && $membersStore[user.id] 
					? $membersStore[user.id].firstname +' '+ $membersStore[user.id].lastname
					: 'Without Name'}
			</strong>
			· postet <UiSince date={new Date(data.createdAt)} />
		</header>
		{@html toHtml(data.comment)}
	</div>
</div>
	

<style>
	.wrapper {
		display:flex;
		flex:row wrap;
	}

	.wrapper:hover .comment{
		background:#FFF;
	}

	.profile {
		width:36px;
		height:36px;
		border-radius: 50%;
		background:var(--c-blue);
		margin:6px 6px 0 0;
	}

	.comment {
		flex-grow: 1;
		padding:18px 12px;
		border-radius: var(--border-radius);
	}

	header {
		font-size:11.5px;
		transform: translateY(-3px);
	}
</style>