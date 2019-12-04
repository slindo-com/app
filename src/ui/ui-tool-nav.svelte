<script>
	import { onMount } from 'svelte'
	import { routerStore } from '../stores/router-store.js'
	import { uiStore } from '../stores/ui-store.js'
	import { authStore } from '../stores/auth-store.js'
	import { membersStore, teamStoreGetUsername } from '../stores/team-store.js'
	import { dateToDatestring } from '../helpers/helpers.js'

	import UiProjectSelect from '../ui/ui-project-select.svelte'
	import UiToolSelect from '../ui/ui-tool-select.svelte'

	
	const TOOLS = [{
		title: 'Tasks',
		slug: 'tasks'
	}, {
		title: 'Times',
		slug: 'times'
	}, {
		title: 'Discussions',
		slug: 'discussions'
	}, {
		title: 'Chat',
		slug: 'chat'
	}, {
		title: 'Calendar',
		slug: 'calendar'
	}, {
		title: 'Files',
		slug: 'files'
	}]

	function getLink(routerStore, slug) {

		return `/${routerStore.project}/${slug}/`
	}

</script>

<nav class="bp-{$uiStore.breakpoint}">

	<ul>
		{#each TOOLS as tool}
			<li>
				<a 
					href="{getLink($routerStore, tool.slug)}"
					class="{$routerStore.view === tool.slug ? 'active' : ''}">
					{tool.title}
				</a>
			</li>
		{/each}
	</ul>

</nav>
	

<style>
	nav {
		width:100%;
		height:48px;
		background:#333;
		text-align: left;
		z-index:500;
		display:flex;
		flex:row;
	}

	ul {
		display: inline-block;
		margin:0 0 0 36px;
		padding:0;
		list-style: none;
		flex-grow: 1;
	}

	li {
		margin:0;
		padding:0;
		float:left;
	}

	a {
		display:block;
		padding:0;
		position: relative;
		font-size:14px;
		font-weight:500;
		color:#FAFAFA;
		transition: color 100ms ease;
		outline:none;
		line-height:36px;
		margin:12px 0 0 0;
		padding:0 12px;
		border-top-left-radius: var(--border-radius);
		border-top-right-radius: var(--border-radius);
	}

	a:hover {
		text-decoration: none;
	}

	.active {
		background:#FAFAFA;
		color:var(--c-font);
	}
</style>