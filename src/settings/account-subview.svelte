<script>
	import { authSignOut } from '../stores/auth-store.js'

	import UiButton from '../ui/ui-button.svelte'
</script>


Account

<UiButton label="Sign Out" on:click={e => authSignOut()} />



<style>

</style>