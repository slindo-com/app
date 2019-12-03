<script>
	import { dateToDatabaseDate, dateGetHumanDate, dateGetHours, dateGetMinutes, dateGetSeconds } from '../helpers/helpers.js'
	import { routerStore } from '../stores/router-store.js'
	import { teamStore } from '../stores/team-store.js'
	import { projectsStore } from '../stores/projects-store.js'
	import { 
		timesStore,
		timesStoreNewTime,
		timesStoreChangeAttributes } from '../stores/times-store.js'

	import UiButton from '../ui/ui-button.svelte'

	export let day

</script>



<div class="wrapper">
		
	<header class="border-horizontal border-bottom">
		<h3>
			{dateGetHumanDate(day)}
		</h3>

		<div class="button-wrapper">
			<UiButton
				label="New Time"
				on:click={e => timesStoreNewTime($projectsStore.active ? $projectsStore.active.id : null, day)} />
		</div>
	</header>

	{#if $timesStore.dates[dateToDatabaseDate(day)]}
		{#each $timesStore.dates[dateToDatabaseDate(day)] as time}
			<a
				href="/{$routerStore.project}/{$routerStore.view}/{$routerStore.subview}/{time.id}/"
				class="entry border-bottom">

				<div class="duration">
					{dateGetHours(time.duration)}:{dateGetMinutes(time.duration)}<small>{dateGetSeconds(time.duration)}</small>
				</div>

				<div class="task">
					{time.task ? 'Some Task' : 'No Task'}
				</div>

				<div class="comment {time.comment && time.comment.length > 0 ? '' : 'empty'}">
					{time.comment && time.comment.length > 0 ? time.comment : 'No Comment'}
				</div>
			</a>
		{/each}
	{/if}

</div>


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
		display:flex;
		margin:0 36px;
		line-height: 48px;
		font-size:14px;
		color:var(--c-font);
		white-space: nowrap;
		overflow:hidden;
		text-overflow: ellipsis;
	}

	.entry:hover {
		text-decoration: none;
		background:#FAFAFA;
	}

	.duration {
		font-weight:600;
	}

	.duration small {
		display: inline-block;
		margin:0 0 0 2px;
		font-size:8px;
		transform: translateY(-4px);
	}

	.task {
		position: relative;
		line-height:30px;
		height:30px;
		margin:9px 12px;
		padding:0 12px;
		border-radius: var(--border-radius);
		background:#F6F5F3;
	}

	.task:after {
		content:'';
		position: absolute;
		top:0;
		left:0;
		width:200%;
		height:200%;
		border:#CCC 1px solid;
		border-radius: calc(var(--border-radius) * 2);
		transform:scale(.5);
		transform-origin: 0 0;
	}

	.comment {

	}

	.comment.empty {
		opacity: .5;
	}

</style>