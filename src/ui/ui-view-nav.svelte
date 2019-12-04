<script>
	import { onMount } from 'svelte'
	import { routerStore } from '../stores/router-store.js'
	import { uiStore } from '../stores/ui-store.js'
	import { authStore } from '../stores/auth-store.js'
	import { membersStore, teamStoreGetUsername } from '../stores/team-store.js'
	import { dateToDatestring } from '../helpers/helpers.js'

	import UiProjectSelect from '../ui/ui-project-select.svelte'
	import UiToolSelect from '../ui/ui-tool-select.svelte'

	
	export let links = []

	let ROUTES = ['timelog', 'reports', 'settings'],
	ELEMENTS_MAP = {},

	activeEl = ELEMENTS_MAP.timelog,
	hoverEl = ELEMENTS_MAP.timelog,
	mousePosition = {
		x: 0,
		y: 0
	}

	$: activeEl = ELEMENTS_MAP[$routerStore.subview] || ELEMENTS_MAP.timelog

	$: activeElOffset = activeEl ? activeEl.getBoundingClientRect().left : 0
	$: activeElWidth = activeEl ? activeEl.getBoundingClientRect().width : 0


	onMount(() => {
		setTimeout(() => {
			activeEl = activeEl
		}, 50)
	})

	function getLink(routerStore, slug) {

		return `/${routerStore.project}/${routerStore.view}/${slug != '-' ? slug + '/' : ''}`
	}

</script>

<nav class="border-bottom bp-{$uiStore.breakpoint}">

	<div class="project-select-wrapper">
		<UiProjectSelect on:recalculateActiveState={e => activeEl = activeEl} />
	</div>
	<!--<div class="tool-select-wrapper">
		<UiToolSelect on:recalculateActiveState={e => activeEl = activeEl} />
	</div>-->

	<ul>
		{#each links as link}
			<li>
				<a 
					href="{getLink($routerStore, link.slug)}"
					bind:this={ELEMENTS_MAP[link.slug]}
					class="{$routerStore.subview === link.slug ? 'active' : ''}"
					on:mouseenter={e => hoverEl = ELEMENTS_MAP[link.slug]}
					data-config="MAIN_NAV">
					<span>
						{link.title}
					</span>
				</a>
			</li>
		{/each}
	</ul>

	{#if activeEl}
		<div
		class="indicator"
		style="{
			'left:' + (activeElOffset + 9) +'px;' + 
			'width:' + (activeElWidth - 18) +'px;'}"></div>
	{/if}

	<a href="/-/settings/" class="settings">
		{teamStoreGetUsername($authStore.user ? $authStore.user.id : 0, $membersStore)}
	</a>
</nav>
<!--<div class="spacer bp-{$uiStore.breakpoint}"></div>-->
	

<style>
	nav {
		width:100%;
		height:48px;
		background:#FAFAFA;
		text-align: left;
		z-index:500;
		display:flex;
		flex:row;
	}

	.project-select-wrapper {
		padding:6px 6px 6px 36px;
	}

	.tool-select-wrapper {
		padding:6px 6px 6px 0;
	}

	/*nav:after {
		content:'';
		position: absolute;
		bottom:0;
		left:0;
		width:100%;
		height: 1px;
		background:#E6E4E1;
	}

	@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) { 
		nav:after {
			background:var(--c-grey);
			transform:scale(1, 0.5);
			transform-origin: 0 100%;
		}
	}*/

	nav.bp-xs:after {
		bottom:auto;
		top:0;
	}

	ul {
		display: inline-block;
		margin:0 0 0 6px;
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
		color:var(--c-font);
		transition: color 100ms ease;
		outline:none;
	}

	a:hover {
		text-decoration: none;
		color:var(--c-blue);
	}

	span {
		display:block;
		padding:0 9px;
		line-height:48px;
		overflow:hidden;
	}

	.spacer {
		height:48px;
	}

	.bp-xs.spacer {
		display:none;
	}

	.indicator {
		position:absolute;
		bottom:0;
		left:50%;
		width:60px;
		height:1px;
		background:var(--c-blue);
		z-index:100;
		transition: all 100ms ease;
		pointer-events: none;
	}

	.settings {
		float:right;
		padding:0 36px;
		line-height: 48px;
	}
</style>