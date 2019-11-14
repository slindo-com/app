<script>
	import { authSignOut } from '../stores/auth-store.js'

	import UiViewNav from '../ui/ui-view-nav.svelte'
	import UiButton from '../ui/ui-button.svelte'


	const LINKS = [{
		title: 'Account',
		slug: '-'
	}, {
		title: 'Team',
		slug: 'team'
	}]
</script>

<UiViewNav links={LINKS} />

Settings

<UiButton label="Sign Out" on:click={e => authSignOut()} />

<style>

</style>