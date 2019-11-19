<script>
	import { onMount, createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher()

	export let value = ''
	export let disabled = false
	export let transparent = false

	let el,
		testEl,
		textareaEl,
		focused = false

	$: disabledVal = disabled ? 'disabled' : ''

	onMount(() => {
		testEl.style.width = textareaEl.getBoundingClientRect().width + 'px'
		textareaEl.style.height = testEl.getBoundingClientRect().height + 'px'
	})

	function focus(e) {
		focused = true
		dispatch('focus')
	}

	function blur(e) {
		focused = false
		dispatch('save', value)
		dispatch('blur')
	}

	function keydown(e) {
		if(e.keyCode === 13) {
			e.preventDefault()
			textareaEl.blur()
		}
		dispatch('keydown', e.keyCode)

		setTimeout(() => {
			value = value.replaceAll(/\n/, ' ')
			value = value.replaceAll(/\t/, ' ')
			value = value.replaceAll('  ', ' ')
			textareaEl.style.height = testEl.getBoundingClientRect().height + 'px'
		})
	}

	function paste(e) {
		setTimeout(() => {
			value = value.replaceAll(/\n/, ' ')
			value = value.replaceAll(/\t/, ' ')
			value = value.replaceAll('  ', ' ')
			textareaEl.style.height = testEl.getBoundingClientRect().height + 'px'
		})
	}

</script>

<div 
	bind:this={el}
	class="wrapper {focused ? 'focused' : ''} {disabled ? 'disabled' : ''} {transparent ? 'transparent' : ''}"
	on:keydown={e => keydown(e)}>
	
	<textarea
		bind:this={textareaEl}
		bind:value={value}
		on:focus={e => focus(e)}
		on:blur={e => blur(e)}
		on:paste={e => paste(e)}
		{disabled}
		data-disable="true"></textarea>
</div>

{#if focused}
	<div 
		class="shadow"
		transition:fade="{{ duration: 100 }}"></div>
{/if}

<div bind:this={testEl} class="test-element">
	{value}
</div>

<style>

.wrapper {
	position:relative;
	margin:0;
	width:100%;
	max-width:560px;
}

.wrapper.transparent textarea {
	background:transparent;
	box-shadow: none;
}

.wrapper.transparent.disabled textarea:hover {
	background:transparent;
	box-shadow:none;
	cursor:default;
}

.wrapper.focused textarea, .wrapper.focused textarea:hover {
	position: relative;
	z-index:1010;
	box-shadow: var(--shadow-overlay);
	background:#FFF;
}

.wrapper textarea {
	-webkit-appearance:none;
	width:100%;
	max-width:100%;
	resize: none;
	height:54px;
	min-height:54px;
	margin:0;
	border:0;
	padding:12px 18px;
	line-height:30px;
	font-size:17px;
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
}

.wrapper textarea:hover {
	background:#FFF;
	box-shadow: 0 0 0 .5px #999 inset, 0 -3px 0 #DDDAD5 inset, -2px 0 0 #F5F5F4 inset;
}

.wrapper textarea:-webkit-autofill {
	animation-duration: 50000s;
	animation-name: onautofillstart;
}

.test-element {
	position: absolute;
	top:-999999px;
	padding:12px 18px;
	line-height:30px;
	font-size:17px;
	font-weight:500;
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

@keyframes onautofillstart { from {} }
</style>