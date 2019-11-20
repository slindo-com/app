<script>
	import { onMount } from 'svelte'
	import { uiStore } from '../stores/ui-store.js'
	import { toHtml } from '../helpers/markdown.js'

	
	export let data = {}

	onMount(() => {
		
	})

</script>


<div class="wrapper">
	<div class="profile">
	</div>
	<div class="comment">
		<header>
			<strong>
				Benjamin Kowalski:
			</strong>
		</header>
		{@html toHtml(data.comment)}
	</div>
</div>
	

<style>
	.wrapper {
		display:flex;
		flex:row wrap;
		margin-bottom:36px;
	}

	.profile {
		width:36px;
		height:36px;
		border-radius: 50%;
		background:var(--c-blue);
		margin-right:18px;
	}

	.comment {

	}

	header {
		font-size:11.5px;
		transform: translateY(-3px);
	}
</style>