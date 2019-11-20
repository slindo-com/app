<script>
	import { uiAgoStore } from '../stores/ui-store.js'
	export let date = new Date()

	$: title = timeSince($uiAgoStore, date)


	function timeSince(date1, date2) {

		const seconds = Math.floor((date1.getTime() - date2.getTime()) / 1000)

		let interval = Math.floor(seconds / 31536000)

		if (interval > 1) {
			return interval + ' years ago'
		}

		interval = Math.floor(seconds / 2592000)

		if (interval > 1) {
			return interval + ' months ago'
		}

		interval = Math.floor(seconds / 86400)

		if (interval > 1) {
			return interval + ' days ago'
		}

		interval = Math.floor(seconds / 3600)

		if (interval > 1) {
			return interval + ' hours ago'
		}

		interval = Math.floor(seconds / 60)

		if (interval > 1) {
			return interval + ' minutes ago'
		}

		return 'some seconds ago'
	}


</script>


{title}