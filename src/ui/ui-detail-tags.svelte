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
		testEl,
		inputEl,
		tagsEl,
		focused = false,
		newTagValue = '',
		inputWidth = 0

	function focus(e) {
		focused = true
		dispatch('focus')
	}

	function blur(e) {
		focused = false
		dispatch('blur')
	}

	function keydownInput(e) {
		error = ''
		dispatch('keydown', e.keyCode)

		if(e.keyCode === 13) {
			value = [...value, newTagValue]
			newTagValue = ''
			dispatch('save', value)
		} else if(e.keyCode === 27) {
			if(newTagValue.length > 0) {
				newTagValue = ''
			}
		} else if(e.keyCode === 37) {
			tagsEl.querySelector('div:last-of-type').focus()
		} else if(e.keyCode === 8 && newTagValue.length === 0) {
			tagsEl.querySelector('div:last-of-type').focus()
		}

		setTimeout(() =>
			inputWidth = testEl.getBoundingClientRect().width + 12
		)
	}

	function keydownTag(e) {
		if(e.keyCode === 8) {
			if(e.target.previousElementSibling) {
				e.target.previousElementSibling.focus()
			} else {
				inputEl.focus()
			}
			value = value.filter(val => val != e.target.textContent)
			dispatch('save', value)
		} else if(e.keyCode === 39) {
			if(e.target.nextElementSibling) {
				e.target.nextElementSibling.focus()
			}
		} else if(e.keyCode === 37) {
			if(e.target.previousElementSibling) {
				e.target.previousElementSibling.focus()
			}
		}
	}

</script>

<div 
	bind:this={el}
	class="wrapper {focused ? 'focused' : ''} {disabled ? 'disabled' : ''} {transparent ? 'transparent' : ''}"
		on:click={e => inputEl.focus()}>
	<label>
		{label}
	</label>
	<div class="tags" bind:this={tagsEl}>
		{#each value as tag}
			<div
				class="tag"
				tabindex="0"
				on:focus={e => focus(e)}
				on:blur={e => blur(e)}
				on:keydown={e => keydownTag(e)}>
				{tag}
			</div>
		{/each}
		<input
			bind:this={inputEl}
			style="width:{value.length > 0 ? inputWidth + 'px' : '100%'}"
			placeholder={value.length > 0 ? '' : 'No labels'}
			type="text"
			bind:value={newTagValue}
			on:focus={e => focus(e)}
			on:blur={e => blur(e)}
			data-disable="true"
			on:keydown={e => keydownInput(e)}>
	</div>

	<div bind:this={testEl} class="test-element">
		{newTagValue}
	</div>


	{#if error && error.length > 0}
		<div class="error" transition:fade="{{delay: 0, duration: 100}}">
			{error}
		</div>
	{/if}

</div>

{#if focused}
	<div 
		class="shadow"
		transition:fade="{{ duration: 100 }}"></div>
{/if}

<style>

.wrapper {
	position:relative;
	margin:0;
	width:100%;
	max-width:560px;
}

.wrapper label {
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

.wrapper.focused label {
	z-index:1020;
}

.wrapper.focused .tags, .wrapper.focused .tags:hover {
	position: relative;
	z-index:1010;
	box-shadow: var(--shadow-overlay);
	background:#FFF;
}

.wrapper.transparent .tags {
	background:transparent;
	box-shadow: none;
}

.wrapper.transparent.disabled .tags:hover {
	background:transparent;
	box-shadow:none;
	cursor:default;
}

.wrapper .tags {
	-webkit-appearance:none;
	width:100%;
	max-width:100%;
	margin:0;
	border:0;
	padding:25px 18px 11px 18px;
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

.wrapper .tags:hover {
	background:#FFF;
	box-shadow: 0 0 0 .5px #999 inset, 0 -3px 0 #DDDAD5 inset, -2px 0 0 #F5F5F4 inset
}

.wrapper .tags:-webkit-autofill {
	animation-duration: 50000s;
	animation-name: onautofillstart;
}

.wrapper .tag {
	position: relative;
	padding:0 6px;
	line-height: 24px;
	background:#FFF;
	display: inline-block;
	margin:0 6px 6px 0;
	border-radius: var(--border-radius);
	font-size:11.5px;
}

.wrapper .tag:after {
	content:'';
	position: absolute;
	top:0;
	left:0;
	width:200%;
	height:200%;
	border:#999 1px solid;
	border-radius: calc(var(--border-radius) * 2);
	transform:scale(.5);
	transform-origin: 0 0;
}

.wrapper .tag:focus {
	background:var(--c-blue);
	color:#FFF;
}

.wrapper .tag:focus:after {
	opacity: 0;
}

.wrapper input {
	display:inline-block;
	padding:0;
	border:0;
	background:#FFF;
	line-height: 30px;
	min-width:30px;
	max-width: 100%;
}

.test-element {
	position: absolute;
	top:-999999px;
	display: inline-block;
	pointer-events: none;
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