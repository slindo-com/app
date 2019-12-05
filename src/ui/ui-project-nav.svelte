<script>
	import { onMount, afterUpdate, createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'
	import { routerStore } from '../stores/router-store.js'
	import { projectsStore } from '../stores/projects-store.js'

	const dispatch = createEventDispatcher()

	$: activeId = $projectsStore.active 
		? $projectsStore.active.id
		: null


	onMount(() => {

	})

</script>



<div class="wrapper">
	<ul>
		{#each $projectsStore.projects as project}
			<li class="{activeId == project.id ? 'active' : ''}">
				<a href="/{project.code}/{$routerStore.view}/{$routerStore.subview != '-' ? $routerStore.subview +'/' : ''}">
					{project.title}
				</a>
			</li>
		{/each}
	</ul>
</div>



<style>

.wrapper {
	background:var(--c-blue);
	width:240px;
	height: 100%;
	float:left;
}

ul {
	border-top:rgba(0, 0, 0, .15) 48px solid;
	margin: 0;
	padding:12px 0 0 0;
	list-style: none;
	box-shadow: 0 0 0 240px rgba(0, 0, 0, .3) inset;
	height:100%;
}

li {
	margin:0;
	padding:0;
}

.active {

}

.active a {
	background:rgba(255, 255, 255, .9);
	color:var(--c-font);
}

a {
	display: block;
	padding:0 12px;
	line-height: 36px;
	color:#FAFAFA;
	text-decoration: none;
	cursor: pointer;
	transition: all 100ms ease;
	margin:0 12px;
	border-radius: var(--border-radius);
	background:transparent;
}

a:hover {
	background:rgba(255, 255, 255, .1);
}
</style>