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
		
	<header>
		<button on:click={e => timesStoreNewTime($projectsStore.active ? $projectsStore.active.id : null, day)}>
			+
		</button>
		<h3>
			{dateGetHumanDate(day)}
		</h3>
	</header>

	{#if $timesStore.dates[dateToDatabaseDate(day)]}
		{#each $timesStore.dates[dateToDatabaseDate(day)] as time, index}
			<a
				href="/{$routerStore.project}/{$routerStore.view}/{$routerStore.subview}/{time.id}/"
				class="entry {index < $timesStore.dates[dateToDatabaseDate(day)].length - 1 ? 'border-bottom' : ''}">

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

	.wrapper {
		padding: 0 0 60px 0;
	}

	header {
		background:#FFF;
		position: sticky;
		top:0;
		margin:0 24px;
		padding: 0;
		display:flex;
		flex:row wrap;
		z-index:100;
	}

	h3 {
		position: relative;
		margin:0;
		line-height:48px;
	}

	h3:after {
		content:'';
		position: absolute;
		bottom:6px;
		left:0;
		width:240px;
		height:1px;
		background:var(--c-font);
		transform:scaleY(.5);
	}

	button {
		position: relative;
		border:0;
		border-radius: 0;
		background:#FFF;
		line-height: 36px;
		padding:0 12px;
		margin:6px 12px 0 0;
		color:var(--c-blue);
		text-align: center;
		cursor: pointer;
		border-radius: 4px;
		width: 36px;
		height:36px;
		box-shadow: 0 -3px 0 #DDDAD5 inset, -2px 0 0 #F5F5F4 inset;

	}

	button:hover {
		text-decoration: none;
	}

	button:after {
	    content:'';
	    display: block;
	    position: absolute;
	    top:0;
	    left:0;
	    width:100%;
	    height:100%;
	    border-radius:var(--border-radius);
	    border:#CCC 1px solid;
	    pointer-events: none;
	    transition: all 100ms ease;
	}

	@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) { 
	    button:after {
	        width:200%;
	        height:200%;
	        border-radius:8px;
	        border:#999 1px solid;
	        transform: scale(.5);
	        transform-origin: 0 0;
	    }
	}



	.entry {
		display:flex;
		margin:0 24px;
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