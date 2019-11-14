<script>
	import UiViewNav from '../ui/ui-view-nav.svelte'


	const LINKS = [{
		title: 'My Tasks',
		slug: '-'
	}, {
		title: 'Tasks',
		slug: 'tasks'
	}]
</script>

<UiViewNav links={LINKS} />



<style>

</style>