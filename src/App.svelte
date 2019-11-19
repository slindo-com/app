<script>
	import { onMount } from 'svelte'
	import { routerStore } from './stores/router-store.js'
	import { authStore, authInit } from './stores/auth-store.js'
	import { timesStoreInit } from './stores/times-store.js'
	import { tasksStoreInit } from './stores/tasks-store.js'
	import { userStoreInit } from './stores/user-store.js'
	import { teamStore, teamStoreInit } from './stores/team-store.js'
	import { projectsStoreInit } from './stores/projects-store.js'
	import { reportsStoreInit } from './stores/reports-store.js'
	import { uiStore, uiStoreInit, uiStoreSetBreakpoint } from './stores/ui-store.js'
	import { getWindowWidth } from './helpers/helpers.js'
	import { sws } from './helpers/sws-client.js'

	import UiFocus from './ui/ui-focus.svelte'

	import SignUp from './sign-in/sign-up-view.svelte'
	import SignIn from './sign-in/sign-in-view.svelte'
	import NewPasswordView from './sign-in/new-password-view.svelte'
	import AccountView from './sign-in/account-view.svelte'

	import TasksView from './tasks/tasks-view.svelte'
	import TimesView from './times/times-view.svelte'
	import SettingsView from './settings/settings-view.svelte'

	let resizing = false,
		debounceTimeout

	const VIEWS = {
		tasks: TasksView,
		times: TimesView,
		settings: SettingsView
	}

const MODELS = {
	'settings': {
		col: 'settings',
		attributes: {
			language: 'EN',
			stopwatchEntryId: null,
			stopwatchStartTime: 0,
		},
		indexes: []
	}, 
	'teams': {
		col: 'teams',
		attributes: {
			title: '',
			members: {}
		},
		indexes: []
	}, 
	'projects': {
		col: 'projects',
		attributes: {
			code: 'AAA',
			title: '',
			color: '#333',
			user: null,
			team: null
		},
		indexes: [
			['team']
		]
	}, 
	'times': {
		col: 'times',
		attributes: {
			duration: 0,
			day: 20000000,
			task: null,
			comment: '',
			user: null,
			team: null
		},
		indexes: [
			['day', 'team'],
			['task', 'team'],
			['user', 'team']
		]
	}, 
	'tasks': {
		col: 'tasks',
		attributes: {
			number: null,
			title: '',
			description: '',
			project: null,
			status: null,
			responsible: null,
			labels: [],
			priority: null,
			due: null,
			user: null,
			team: null
		},
		indexes: [
			['number'],
			['team'],
			['team', 'project'],
			['team', 'project', 'user']
		]
	}, 
	'comments': {
		col: 'comments',
		attributes: {
			type: null,
			comment: '',
			project: null,
			user: null,
			team: null
		},
		indexes: [
			['team'],
			['team', 'type']
		]
	}
}

	onMount(async () => {

		uiStoreInit()
		uiStoreSetBreakpoint(getWindowWidth())

		await sws.init({
			server: 'SERVER_URL',
			models: MODELS
		})

		authInit()
		timesStoreInit()
		tasksStoreInit()
		userStoreInit()
		teamStoreInit()
		projectsStoreInit()
		reportsStoreInit()
	})

	function resize() {
		clearTimeout(debounceTimeout)
		debounceTimeout = setTimeout(() => {
			//resizing = true;
			setTimeout(() => {
				resizing = false
			}, 10)

			uiStoreSetBreakpoint(getWindowWidth())
		}, 300)
	}

const COLORS = [
  '#B33C24', '#B37D47', '#B3A147', '#A1B347', '#7DB347',
  '#68B359', '#47B359', '#47B37D', '#47B3A1', '#47A1B3',
  'var(--c-blue)', '#4759B3', '#5947B3', '#7D47B3', '#A147B3',
  '#B359A4', '#B3477D', '#B34759', '#4D4D4D'
]

</script>

{#if !resizing}

	{#if $routerStore.view === 'account'}
		<AccountView />
	{:else if $authStore.inited && !$authStore.hasAuth}
		{#if $routerStore.view === 'sign-up'}
			<SignUp />
		{:else if $routerStore.view === 'new-password'}
			<NewPasswordView />
		{:else}
			<SignIn />
		{/if}
	{:else}
		<svelte:component this={VIEWS[$routerStore.view]}/>
	{/if}

{/if}

<!-- <UiFocus /> -->

<svelte:window on:resize={e => resize()} />