<script>
	import { routerStore } from '../stores/router-store.js'

	export let wide = false
	export let nonav = false

	$: hasDetail = $routerStore.detail ? true : false
</script>

{#if hasDetail}
	<section class="border-vertical {wide ? 'wide' : ''} {nonav ? 'no-nav' : ''}">
		<slot></slot>
	</section>
{/if}
	
<style>
	section {
		position: absolute;
		top:102px;
		bottom:6px;
		right:6px;
		width:354px;
		background:#F6F5F3;
		overflow-x: hidden;
		overflow-y: auto;
		border-radius: var(--border-radius);
		border-top-left-radius:0;
		border-bottom-left-radius:0;
	}

	.no-nav {
		top:54px;
	}

	.wide {
		width:calc(100% - 372px);
	}


</style>