<script>
	import { onMount, afterUpdate, createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'
	import { toMarkdown, toHtml } from '../helpers/markdown.js'

	const dispatch = createEventDispatcher()

	export let placeholder = ''
	export let value = ''
	export let disabled = false
	export let error = ''
	export let transparent = false
	export let isFilled = false

	let el,
		editorEl,
		valueIntern = '',
		html = '',
		focused = false,
		prefilled = false

	$: disabledVal = disabled ? 'disabled' : ''

	onMount(() => {
		valueIntern = value
		markdownToHtml()
	})

	afterUpdate(() => {
		if(valueIntern != value) {

			valueIntern = value
			markdownToHtml()
		}
		setTimeout(() => isFilled = html.trim().length > 0)
	})

	export function set(newValue) {
		valueIntern = newValue
		markdownToHtml()
	}

	export function get(newValue) {
		return toMarkdown(html)
	}

	function markdownToHtml() {
		html = toHtml(valueIntern)
	}

	function focus(e) {
		focused = true
		dispatch('focus')
	}

	function blur(e) {
		focused = false
		dispatch('save', toMarkdown(html))
		dispatch('blur')
	}

	function keydown(e) {

		prefilled = false
		error = ''
		dispatch('keydown', e.keyCode)

		setTimeout(() => {
			isFilled = html.trim().length > 0
		})
	}

	function paste(e) {
		setTimeout(sanitize, 0)
	}

	function sanitize() {
 
		let found = false

		let elements = editorEl.querySelectorAll('*');
		Array.prototype.forEach.call(elements, (el, i) => {

			for(let i = el.attributes.length - 1; i >= 0; i--) {
				if(el.attributes[i].name != 'href') {
					el.removeAttribute(el.attributes[i].name)
				}
			}

			if( !isMatching(el, 'div, a, strong, b, u, i, em, ul, li, br')) {
				el.outerHTML = el.innerHTML
				found = true
			}

			if(el.textContent.length === 0 && el.parentNode) {
				el.parentNode.removeChild(el)
				found = true
			}

			for (let innerEl of el.children) {
				if( isMatching(innerEl, 'div') && el.parentNode) {
					el.outerHTML = el.innerHTML
					found = true
				}
			}
		})

		if(found) {
			sanitize()
		} else {
			html = editorEl.innerHTML
		}
	}

	function isMatching (el, selector) {
		return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector)
	}


</script>

<div 
	bind:this={el}
	class="wrapper {focused ? 'focused' : ''} {disabled ? 'disabled' : ''} {transparent ? 'transparent' : ''} {value.length > 0 || prefilled ? 'filled' : ''}"
		on:keydown={e => keydown(e)}>

	<div
		class="editable"
		contenteditable="true"
		bind:this={editorEl}
		bind:innerHTML={html}
		on:focus={e => focus(e)}
		on:blur={e => blur(e)}
		on:paste={e => paste(e)}>
	</div>

	{#if value.trim().length === 0}
		<div class="placeholder">
			{placeholder}
		</div>
	{/if}

	{#if error && error.length > 0}
		<div class="error" transition:fade="{{delay: 0, duration: 100}}">
			{error}
		</div>
	{/if}

	{#if false && focused}
		<div class="shadow">t</div>
	{/if}
</div>

<style>

.wrapper {
	position:relative;
	margin:0;
	width:100%;
}

.wrapper.transparent .editable {
	background:transparent;
	box-shadow: none;
}

.wrapper.focused .editable, .wrapper.focused .editable:hover {
	position: relative;
	z-index:1010;
	box-shadow: var(--shadow-overlay);
	background:#FFF;
}

.wrapper.disabled .editable {
	border-color:red; /*TODO*/
}

.wrapper.disabled:hover .editable, .wrapper.disabled:focus .editable {
	border-color:red; /*TODO*/
}

.wrapper .editable {
	-webkit-appearance:none;
	width:100%;
	max-width:100%;
	margin:0;
	border:0;
	padding:12px 18px;
	line-height:24px;
	font-size:14px;
	font-weight:400;
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
	cursor:caret;
}

.wrapper .editable:hover {
	background:#FFF;
	box-shadow: 0 0 0 .5px #999 inset, 0 -3px 0 #DDDAD5 inset, -2px 0 0 #F5F5F4 inset
}

.wrapper .editable:-webkit-autofill {
	animation-duration: 50000s;
	animation-name: onautofillstart;
}

.placeholder {
	position: absolute;
	top:50%;
	left:18px;
	width:calc(100% - 36px);
	transform:translateY(-50%);
	pointer-events: none;
	opacity: .5;
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