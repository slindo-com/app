<script>
	import Page from 'page'
	import { routerStore } from '../stores/router-store.js'

	export let narrow = false

	$: hasDetail = $routerStore.detail ? true : false


	function click(routerStore) {
		Page(`/${routerStore.project}/${routerStore.view}/${routerStore.subview != '-' ? routerStore.subview + '/' : ''}`)
	}
</script>

<section 
	class="{narrow ? 'narrow' : ''} {hasDetail ? 'has-detail' : ''}"
	on:click={e => click($routerStore)}>
	<slot></slot>
</section>
	
<style>
	section {
		width:100%;
		height: calc(100% - 48px);
		overflow-x: hidden;
		overflow-y: auto;
		transition: width 100ms ease;
	}

	.has-detail {
		width:calc(100% - 360px);
	}

	.narrow.has-detail {
		width:360px;
	}
</style>