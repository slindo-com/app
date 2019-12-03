<script>
	import { dateToDatabaseDate, dateGetHours, dateGetMinutes, dateGetSeconds } from '../helpers/helpers.js'
	import { routerStore } from '../stores/router-store.js'
	import { teamStore } from '../stores/team-store.js'
	import { projectsStore } from '../stores/projects-store.js'
	import { 
		timesStore,
		timesStoreNewTime,
		timesStoreChangeAttributes } from '../stores/times-store.js'

	import UiButton from '../ui/ui-button.svelte'
	import UiViewNav from '../ui/ui-view-nav.svelte'
	import UiViewSection from '../ui/ui-view-section.svelte'
	import UiDetailSection from '../ui/ui-detail-section.svelte'

	// import TasksDetail from '../tasks/tasks-details.svelte'

	const LINKS = [{
		title: 'My Times',
		slug: '-'
	}, {
		title: 'Reports',
		slug: 'reports'
	}]

	$: isMyTimes = $routerStore.subview === '-'

</script>

<UiViewNav links={LINKS} />

<UiViewSection>
		
	<header class="border-horizontal border-bottom">
		<h3>
			{isMyTimes ? 'My Times' : 'Reports'}
		</h3>

		<div class="button-wrapper">
			<UiButton
				label="New Time"
				on:click={e => timesStoreNewTime($projectsStore.active ? $projectsStore.active.id : null)} />
		</div>
	</header>

	{#if $timesStore.dates[dateToDatabaseDate(new Date())]}
		{#each $timesStore.dates[dateToDatabaseDate(new Date())] as time}
			<a
				href="/{$routerStore.project}/{$routerStore.view}/{$routerStore.subview}/{time.id}/"
				class="entry border-bottom">

				<div class="duration">
					{dateGetHours(time.duration)}:{dateGetMinutes(time.duration)}<small>{dateGetSeconds(time.duration)}</small>
				</div>

				<div class="task">
					{time.task ? 'Some Task' : 'No Task'}
				</div>

				<div class="comment empty">
					No comment
				</div>
			</a>
		{/each}
	{/if}

</UiViewSection>
<UiDetailSection>
	{#if $timesStore.detailTime}
		TIME
	{/if}
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