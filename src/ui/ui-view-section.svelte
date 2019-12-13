<script>
	import Page from 'page'
	import { routerStore } from '../stores/router-store.js'

	export let narrow = false
	export let nonav = false

	$: hasDetail = $routerStore.detail ? true : false


	function click(routerStore) {
		Page(`/${routerStore.project}/${routerStore.view}/${routerStore.subview != '-' ? routerStore.subview + '/' : ''}`)
	}
</script>

<section 
	class="{narrow ? 'narrow' : ''} {nonav ? 'no-nav' : ''} {hasDetail ? 'has-detail' : ''}"
	on:click={e => click($routerStore)}>
	<slot></slot>
</section>
	
<style>
	section {
		width:100%;
		height: calc(100% - 48px - 48px);
		overflow-x: hidden;
		overflow-y: auto;
		transition: width 100ms ease;
	}

	.no-nav {
		height: calc(100% - 48px);
	}

	.has-detail {
		width:calc(100% - 360px);
	}

	.narrow.has-detail {
		width:360px;
	}
</style>