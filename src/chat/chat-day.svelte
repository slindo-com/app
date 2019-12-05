<script>
	import { dateToDatabaseDate, dateGetHumanDate, dateGetHours, dateGetMinutes, dateGetSeconds } from '../helpers/helpers.js'
	import { routerStore } from '../stores/router-store.js'
	import { teamStore } from '../stores/team-store.js'
	import { projectsStore } from '../stores/projects-store.js'
	import { 
		messagesStore } from '../stores/messages-store.js'

	export let day
</script>



<div class="wrapper">
		
	<h3>
		{dateGetHumanDate(day)}
		
	</h3>
	{#if $messagesStore.dates[dateToDatabaseDate(day)]}
		{#each $messagesStore.dates[dateToDatabaseDate(day)] as message, index}
		
			<div class="message">
				{message.message}
			</div>

		{/each}
	{/if}

</div>


<style>

	.wrapper {
		padding: 24px;
	}

	
	h3 {
		position: relative;
		margin:0;
		line-height:48px;
	}

	.message {
		background:#EEE;
		border-radius: var(--border-radius);
		padding:6px;
		margin-top:6px;
	}

</style>