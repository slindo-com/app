<script>
	import { onMount, createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher()

	export let label = 'No Label'
	export let type = 'text'
	export let value = ''
	export let disabled = false
	export let error = ''
	export let transparent = false

	let el,
		focused = false,
		prefilled = false

	$: disabledVal = disabled ? 'disabled' : ''

	onMount(() => {
		setTimeout(() => {
			if(el) {
				const inputEl = el.querySelector('input')
				if(inputEl) {
					inputEl.addEventListener('animationstart', () => prefilled = true)
				}
			}
		})
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

</script>

<div 
	bind:this={el}
	class="input-wrapper {focused ? 'focused' : ''} {disabled ? 'disabled' : ''} {transparent ? 'transparent' : ''} {value.length > 0 || prefilled ? 'filled' : ''}"
		on:keydown={e => keydown(e)}>
	<label>
		{label}
	</label>
	{#if type === 'email'}
		<input
			type="email"
			bind:value={value}
			on:focus={e => focus(e)}
			on:blur={e => blur(e)}
			{disabled}
			data-disable="true">
	{:else if type === 'password'}
		<input
			type="password"
			bind:value={value}
			on:focus={e => focus(e)}
			on:blur={e => blur(e)}
			{disabled}
			data-disable="true">
	{:else}
		<input
			type="text"
			bind:value={value}
			on:focus={e => focus(e)}
			on:blur={e => blur(e)}
			{disabled}
			data-disable="true">
	{/if}

	{#if error && error.length > 0}
		<div class="error" transition:fade="{{delay: 0, duration: 100}}">
			{error}
		</div>
	{/if}

	{#if focused}
		<div class="shadow"></div>
	{/if}

</div>

<style>

.input-wrapper {
	position:relative;
	margin:0;
	width:100%;
	max-width:560px;
}

.input-wrapper label {
	line-height:11.5px;
	position:absolute;
	top:50%;
	left:18px;
	font-size:12px;
	transform-origin:0 0;
	transform:translateY(-50%);
	padding:0;
	transition:top 100ms ease;
	color:var(--c-font);
	pointer-events:none;
}

.input-wrapper.focused label,
.input-wrapper.filled label {
	top:18px;
}

.input-wrapper.focused input,
.input-wrapper.filled input {
	padding:25px 18px 11px 18px;
}

.input-wrapper.focused label {
	z-index:1020;
}

.input-wrapper.focused input, .input-wrapper.focused input:hover {
	position: relative;
	z-index:1010;
	box-shadow: var(--shadow-overlay);
	background:#FFF;
}

.input-wrapper.disabled input {
	border-color:red; /*TODO*/
}

.input-wrapper.disabled:hover input, .input-wrapper.disabled:focus input {
	border-color:red; /*TODO*/
}

.input-wrapper.transparent input {
	background:transparent;
	box-shadow: none;
}

.input-wrapper input {
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
}

.input-wrapper input:hover {
	background:#FFF;
	box-shadow: 0 0 0 .5px #999 inset, 0 -3px 0 #DDDAD5 inset, -2px 0 0 #F5F5F4 inset
}

.input-wrapper input:-webkit-autofill {
	animation-duration: 50000s;
	animation-name: onautofillstart;
}

.error {
	position: absolute;
	top:100%;
	left:18px;
	background:var(--c-darkgrey);
	font-size:14px;
	line-height: 24px;
	margin:-3px 0 0 0;
	padding:0 12px;
	border-radius: 6px;
	color:#FFF;
	box-shadow:var(--shadow-overlay);
}

.error:after {
	content:'';
	display: block;
	width:6px;
	height:6px;
	position: absolute;
	top:0;
	left:50%;
	background:var(--c-darkgrey);
	transform: translateX(-50%) translateY(-50%) rotateZ(45deg);
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