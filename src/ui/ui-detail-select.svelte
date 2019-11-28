<script>
	import { onMount, createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher()

	export let label = 'No Label'
	export let empty = ''
	export let value = null
	export let transparent = false
	export let options = []

	let el,
		searchEl,
		focused = false,
		opened = false,
		searchTerm = ''

	$: filteredOptions = options
		.filter(val => val.title.toLowerCase().includes(searchTerm.toLowerCase()))

	$: valueOption = options.find(option => option.id === value)
	$: valueTitle = valueOption ? valueOption.title : (empty.length > 0 ? empty : 'Nothing selected')


	onMount(() => {

	})

	function focus(e) {
		focused = true
		dispatch('focus')
	}

	function blur(e) {
		focused = false
		dispatch('blur')
	}

	function keydown(e) {
		prefilled = false
		error = ''
		dispatch('keydown', e.keyCode)
	}

	function clickButton(e) {
		opened = true
		setTimeout(() => searchEl.focus())
	}

	function clickOption(id) {
		value = id
		opened = false
		dispatch('save', id)
	}

	function clickShadow() {
		opened = false
	}

</script>



<div class="wrapper {opened ? 'opened' : ''}">
	<button
		class="{focused ? 'focused' : ''} {transparent ? 'transparent' : ''}"
		on:click={e => clickButton(e)}>
		<span>
			{label}
		</span>
		<p>
			{valueTitle}
		</p>
	</button>

	{#if opened}
		<div class="overlay">
			<input
				type="search"
				bind:this={searchEl}
				bind:value={searchTerm}
				placeholder="Search">
			<div class="options border-top">
				<ul>
					{#each filteredOptions as option}
						<li on:click={e => clickOption(option.id)}>
							{option.title}
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
		on:click={e => clickShadow()}></div>
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

button span {
	line-height:11.5px;
	position:absolute;
	top:18px;
	left:18px;
	font-size:12px;
	transform-origin:0 0;
	transform:translateY(-50%);
	padding:0;
	transition:top 100ms ease;
	color:var(--c-font);
	pointer-events:none;
}





button.focused p, button.focused p:hover {
	box-shadow: var(--shadow-overlay);
	background:#FFF;
}

button.transparent p {
	background:transparent;
	box-shadow: none;
}

button p {
	-webkit-appearance:none;
	width:100%;
	max-width:100%;
	margin:0;
	border:0;
	padding:18px;
	line-height:24px;
	font-size:14px;
	font-weight:500;
	background:#FFF;
	border-radius:var(--border-radius);
	box-shadow:none;
	caret-color:var(--c-blue);
	box-shadow:0 0 0 100px #FFF inset;
	outline-style:solid;
	outline-color:rgba(0, 0, 255, .25);
	outline-width:0;
	outline-offset:2px;
	color:var(--c-font);
	transition: border-color 100ms ease;
	cursor:pointer;
	padding:25px 18px 11px 18px;
}

button p:hover {
	background:#FFF;
	box-shadow: 0 0 0 .5px #999 inset, 0 -3px 0 #DDDAD5 inset, -2px 0 0 #F5F5F4 inset
}

.overlay {
	position: absolute;
	top:0;
	left:0;
	width:100%;
	background:#FFF;
	border-radius: var(--border-radius);
	box-shadow: var(--shadow-overlay);
}

input {
	background:transparent;
	margin:0;
	padding:0 12px;
	display:block;
	width:100%;
	height:48px;
	border:0;
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
	line-height: 42px;
	padding:0 12px;
	cursor: pointer;
}

.options li:hover {
	background:#FAFAFA;
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