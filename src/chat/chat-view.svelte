<script>
	import { onMount, beforeUpdate, afterUpdate } from 'svelte'
	import { get } from 'svelte/store'
	import { routerStore } from '../stores/router-store.js'
	import { teamStore } from '../stores/team-store.js'
	import { projectsStore } from '../stores/projects-store.js'
	import { 
		messagesStore,
		messagesStoreObserveNewDay,
		messagesStoreNewMessage } from '../stores/messages-store.js'
	import { datePrevDate } from '../helpers/helpers.js'

	import UiDetailEditable from '../ui/ui-detail-editable.svelte'
	import ChatDay from '../chat/chat-day.svelte'

	let chatMessage = '',
		chatMessageEl,
		dayNow = new Date(),
		days = [dayNow],
		streamEl,
		streamInnerEl,
		scrolledToBottom = true,
		streamInnerElHeight = 0,
		scrollTop = 0

	onMount(() => {

		messagesStoreObserveNewDay(dayNow)
		
		projectsStore.subscribe(() => {
			window.requestAnimationFrame(addDay)
		})

		messagesStore.subscribe(() => {
			window.requestAnimationFrame(() => {
				if(streamEl && scrolledToBottom) {
					streamEl.scrollTop = streamInnerEl.getBoundingClientRect().height
				} else {
					if(streamInnerEl) {
						const newScrollTop = (streamInnerElHeight - streamInnerEl.getBoundingClientRect().height) * -1

						if( newScrollTop > 0) {
							streamEl.scrollTop = newScrollTop
						}

					}
				}
			})
		})
	})


	beforeUpdate(() => {

	})


	afterUpdate(() => {

	})


	function submit(e) {

		const { active } = get(projectsStore)

		messagesStoreNewMessage(active.id, (new Date()), chatMessageEl.get())
		setTimeout(() => chatMessageEl.set(''))
	}

	function addDay() {
		const { active } = get(projectsStore)

		if(active) {
			const createdAtDay = new Date(active.createdAt)

			if(dayNow >= createdAtDay) {

				if(streamEl && streamInnerEl) {

					const isStreamScrollable = streamInnerEl.getBoundingClientRect().height > streamEl.getBoundingClientRect().height,
						isScrolledToTop = streamEl.scrollTop === 0

					if(!isStreamScrollable || isScrolledToTop) {

						dayNow = datePrevDate(dayNow)
						messagesStoreObserveNewDay(dayNow)
						days = [dayNow, ...days]
						window.requestAnimationFrame(addDay)
					}
				}
			}
		}
	}

	function scroll(e) {
		streamInnerElHeight = streamInnerEl.getBoundingClientRect().height
		scrollTop = streamEl.scrollTop
		scrolledToBottom = streamEl.scrollTop + streamEl.getBoundingClientRect().height === streamInnerEl.getBoundingClientRect().height

		if(streamEl.scrollTop === 0) {
			addDay()
		}
	}

</script>
<div class="wrapper">
	<div class="stream" bind:this={streamEl} on:scroll={e => scroll()}>
		<div class="inner" bind:this={streamInnerEl}>
			{#each days as day}
				<ChatDay day={day} />
			{/each}
		</div>
	</div>
	<div class="input">
		<UiDetailEditable
			placeholder="Click here to write a new message"
			bind:this={chatMessageEl}
			on:submit={e => submit(e)}
			on:save={e => console.log(e.detail)}
			sendOnEnter />
	</div>
</div>

<style>

	.wrapper {
		height:calc(100% - 48px);
		display: flex;
		flex-direction:column;
	}

	.stream {
		flex:1;
		overflow-x:hidden;
		overflow-y:auto;
	}

	.input {
		padding:12px;
		background:#F6F5F3;
	}


</style>