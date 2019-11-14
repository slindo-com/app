<script>
	import { routerStore } from '../stores/router-store.js'

	export let wide = false

	$: hasDetail = $routerStore.detail ? true : false
</script>

{#if hasDetail}
	<section class="{wide ? 'wide' : ''}">
		<slot></slot>
	</section>
{/if}
	
<style>
	section {
		position: absolute;
		top:54px;
		bottom:6px;
		right:6px;
		width:354px;
		background:#F6F5F3;
		overflow-x: hidden;
		overflow-y: auto;
		border-radius: var(--border-radius);
	}

	.wide {
		width:calc(100% - 372px);
	}


</style>