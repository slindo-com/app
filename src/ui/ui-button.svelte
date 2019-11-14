<script>
	import { createEventDispatcher } from 'svelte'
	import UiIcon from './ui-icon.svelte'

	const dispatch = createEventDispatcher()

	export let label = 'No Label'
	export let type = 'default'
	export let icon = 'arrow-left'
	export let hovered = false
	export let color = 'var(--c-blue)'
	export let link = null
	export let disabled = false
	export let focusConfig = 'EMPTY'
	export let focusTop = null


	let el,
		hover = false


	function click(e) {
		if(!link) {
			e.stopPropagation()
			e.preventDefault()
		}
		dispatch('click', '')
	}


	export function focus() {
		el.focus()
	}
</script>


<a
	href="{link ? link : '#'}"
	class="type-{type} {hovered ? 'hovered': ''} {disabled ? 'disabled': ''}"
	style="{'color:'+ color +';'}"
	bind:this={el}
	on:click={e => click(e)}
	on:mouseenter={e => hover = true}
	on:mouseleave={e => hover = false}
	data-config="{focusConfig}"
	data-top={focusTop}>
	<span>
		{#if type === 'default' || type === 'icon-right' || type === 'dark' }	
			{label}
		{:else if type === 'icon' || type === 'entry' || type === 'entry has-stopwatch'}
			<UiIcon type={icon} color="{color}" />
		{/if}
	</span>
	{#if type === 'icon-right' }
		<span>
			<i style="display:block;transform:rotate(-90deg)">
				<UiIcon type={icon} color="{color}" />
			</i>	
		</span>
	{/if}
</a>

<style>
	a {
		display:inline-block;
		position: relative;
		border:0;
		border-radius: var(--border-radius);
		background:#FFF;
		cursor: pointer;
		/* box-shadow: 0 6px 0 -3px rgba(0, 0, 0, .05); */
		transition: all 100ms ease;
		outline:none;
		box-shadow: 0 -3px 0 #DDDAD5 inset, -2px 0 0 #F5F5F4 inset;
	}

	a:hover {
		text-decoration: none;
		box-shadow: 0 -2px 0 #DDDAD5 inset, -2px 0 0 #F5F5F4 inset; 
	}

	a:hover span {
		transform: translateY(1px);
	}

	a:active {
		background: #99815C;
		transform: translateY(2px);
		box-shadow: 0 -4px 0 -3px rgba(0, 0, 0, .05);
	}

	a:after {
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
	}

	@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) { 
	    a:after {
	        width:200%;
	        height:200%;
	        border-radius:8px;
	        border:#999 1px solid;
	        transform: scale(.5);
	        transform-origin: 0 0;
	    }
	}


	a.disabled {
		cursor:default;
		box-shadow: none;
		pointer-events:none;
	}

	.type-icon {
		width:42px;
		height:42px;
	}

	.type-icon span {
		display: block;
		width:40px;
		height:40px;
		padding:0;
		padding:14px;
	}

	.type-icon em:after, .type-entry em:after {
		width: 60px;
		height: 60px;
	}

	.type-entry {
		width:36px;
		height:36px;
		background:#FFF;
		box-shadow:none;
	}

	.type-entry:hover {
		transform: none;
		box-shadow: 0 6px 0 -3px rgba(0, 0, 0, .05);
	}

	.type-entry.hovered {
		background:var(--c-grey);
		box-shadow: 0 6px 0 -3px rgba(0, 0, 0, .05);
	}


	.type-entry span {
		display: block;
		width:34px;
		height:34px;
		padding:11px;
	}

	.type-dark {
		background:var(--c-darkgrey);
	}

	.type-dark span {
		color:#FFF;
		background:var(--c-darkgrey);
	}

	.has-stopwatch {
		border-top-right-radius:0;
		border-bottom-right-radius:0;
	}

	.has-stopwatch span {
		border-top-right-radius:0;
		border-bottom-right-radius:0;
		width:35px;
	}

	.has-stopwatch.hovered {
		box-shadow: none;
	}

	.type-icon-right {
		display:flex;
		flex-flow: row wrap;
	}

	.type-icon-right span {
		
	}

	.type-icon-right span:first-of-type {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}

	.type-icon-right span:last-of-type {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
		margin-left:1px;
		width:40px;
		padding:14px;
	}

	span {
		display: block;
		line-height:42px;
		padding:0 18px;
		font-size:14px;
		font-weight:600;
		-webkit-font-smoothing:antialiased;
		transition: all 100ms ease;
	}

	.disabled span {
		color:var(--c-grey);
	}

	em {
		display:block;
		width:100%;
		height:100%;
		position: absolute;
		top:0;
		left:0;
		background:transparent;
		border-radius: 6px;
		overflow:hidden;
	}

	em:after {
		content: '';
		display:block;
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: 120px;
		height: 120px;
		background: radial-gradient(circle closest-side, #FAD000, transparent);
		transform: translate(-50%, -50%) scale(0);
		transition: transform 500ms ease;
		pointer-events: none;
	}

	a:hover em:after {
		transform: translate(-50%, -50%) scale(1);
	}

</style>