import { writable } from 'svelte/store'
import Page from 'page'
import { dateToDatestring } from '../helpers/helpers.js'



export const routerStore = writable({
  view: 'index',
  subview: null
})


Page({
	hashbang: true
})

Page('/', () => Page('/-/tasks/SLI/'))

Page('/:team/', data => 
	routerStore.set({
		team: data.params.team,
		view: data.params.view,
		project: data.params.project,
		subview: data.params.subview,
		detail: data.params.detail
	})
)

Page('/:team/:view/', data => 
	routerStore.set({
		team: data.params.team,
		view: data.params.view,
		project: data.params.project,
		subview: data.params.subview,
		detail: data.params.detail
	})
)

Page('/:team/:view/:project/', data => 
	routerStore.set({
		team: data.params.team,
		view: data.params.view,
		project: data.params.project,
		subview: data.params.subview || '-',
		detail: data.params.detail
	})
)

Page('/:team/:view/:project/:subview/', data =>
	routerStore.set({
		team: data.params.team,
		view: data.params.view,
		project: data.params.project,
		subview: data.params.subview,
		detail: data.params.detail
	})
)

Page('/:team/:view/:project/:subview/:detail/', data =>
	routerStore.set({
		team: data.params.team,
		view: data.params.view,
		project: data.params.project,
		subview: data.params.subview,
		detail: data.params.detail
	})
)

Page('/sign-up/:key/:email/', data => {
	routerStore.set({
		view: 'sign-up',
		key: data.params.key,
		email: data.params.email
	})
})


Page()