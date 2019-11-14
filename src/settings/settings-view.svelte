<script>

	import { routerStore } from '../stores/router-store.js'

	import UiViewNav from '../ui/ui-view-nav.svelte'
	import UiButton from '../ui/ui-button.svelte'

	import AccountSubview from '../settings/account-subview.svelte'
	import TeamSubview from '../settings/team-subview.svelte'
	import ProjectsSubview from '../settings/projects-subview.svelte'


	const LINKS = [{
		title: 'Account',
		slug: '-'
	}, {
		title: 'Team',
		slug: 'team'
	}, {
		title: 'Projects',
		slug: 'projects'
	}]

	const SUBVIEWS = {
		'-': AccountSubview,
		'team': TeamSubview,
		'projects': ProjectsSubview
	}

</script>

<UiViewNav links={LINKS} />

Settings – 

<svelte:component this={SUBVIEWS[$routerStore.subview]}/>

<style>

</style>