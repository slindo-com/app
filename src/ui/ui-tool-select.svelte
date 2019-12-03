<script>
	import { onMount, afterUpdate, createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'
	import { routerStore } from '../stores/router-store.js'
	import { projectsStore } from '../stores/projects-store.js'

	const dispatch = createEventDispatcher(),

		TOOLS = [{
			title: 'Tasks',
			slug: 'tasks'
		}, {
			title: 'Times',
			slug: 'times'
		}]


	let el,
		focused = false,
		opened = false


	$: titleElement = TOOLS.find(val => $routerStore.view === val.slug)
	$: title = titleElement ? titleElement.title : 'Settings'

	onMount(() => {

	})

	afterUpdate(() => {
		dispatch('recalculateActiveState')
	})

</script>



<div class="wrapper {opened ? 'opened' : ''}">
	<button
		class="{focused ? 'focused' : ''}"
		on:click={e => opened = true}>
		<p>
			{title}
		</p>
	</button>

	{#if opened}
		<div class="overlay">
			<div class="options border-top">
				<ul>
					{#each TOOLS as tool}
						<li>
							<a href="/{$routerStore.project}/{tool.slug}/{$routerStore.subview}/" on:click={e => opened = false}>
								{tool.title}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}
</div>

{#if opened}
	<div
		class="shadow"
		transition:fade="{{ duration: 100 }}"
		on:click={e => opened = false}></div>
{/if}



<style>

.wrapper {

}

.wrapper.opened {
	position: relative;
	z-index: 1010;
}

button {
	position:relative;
	margin:0;
	width:100%;
	max-width:560px;
	background:transparent;
	border:0;
	padding:0;
	text-align: left;
}


button.focused p, button.focused p:hover {

}

button p {
	-webkit-appearance:none;
	width:100%;
	max-width:100%;
	margin:0;
	border:0;
	line-height:24px;
	font-size:14px;
	font-weight:500;
	background:var(--c-blue);
	border-radius:var(--border-radius);
	box-shadow:none;
	caret-color:#FFF;
	outline-style:solid;
	outline-color:rgba(0, 0, 255, .25);
	outline-width:0;
	outline-offset:2px;
	color:#FFF;
	transition: all 100ms ease;
	cursor:pointer;
	padding:6px 12px 6px 12px;
}

button p:hover {
	background:var(--c-font);
}

.overlay {
	position: absolute;
	top:0;
	left:0;
	width:240px;
	background:#FFF;
	border-radius: var(--border-radius);
	box-shadow: var(--shadow-overlay);
}


.options {
	margin:0 12px;
}

.options ul {
	margin:0 -12px;
	padding:0;
	list-style: none;
}

.options li {
	margin:0;
	padding:0;
}

.options li:hover {
	background:#FAFAFA;
}

.options li a {
	display: block;
	padding:0 12px;
	line-height: 42px;
	color:var(--c-font);
	text-decoration: none;
	cursor: pointer;
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
</style>