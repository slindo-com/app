<script>
	import { onMount } from 'svelte'
	import { get } from 'svelte/store'
	import { routerStore } from '../stores/router-store.js'
	import { teamStore } from '../stores/team-store.js'
	import { projectsStore } from '../stores/projects-store.js'
	import { 
		messagesStore,
		messagesStoreObserveNewDay,
		messagesStoreNewMessage } from '../stores/messages-store.js'

	import UiDetailEditable from '../ui/ui-detail-editable.svelte'
	import ChatDay from '../chat/chat-day.svelte'

	let chatMessage = '',
		chatMessageEl,
		dayNow = new Date(),
		days = [dayNow]

	onMount(() => {
		messagesStoreObserveNewDay(new Date())

		/*for(let i = 0; i < 20; i++) {
			dayNow = datePrevDate(dayNow)
			timesStoreObserveNewDay(dayNow)
			days = [...days, dayNow]
		}*/
	})


	function submit(e) {

		const { active } = get(projectsStore)

		messagesStoreNewMessage(active.id, (new Date()), chatMessageEl.get())
		setTimeout(() => chatMessageEl.set(''))
	}

</script>
<div class="wrapper">
	<div class="stream">
		{#each days as day}
			<ChatDay day={day} />
		{/each}
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
	}

	.input {
		padding:12px;
		background:#F6F5F3;
	}


</style>