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

Page('/', () => Page('/SLI/tasks/'))

Page('/', data => 
	routerStore.set({
		project: data.params.project,
		view: data.params.view,
		subview: data.params.subview,
		detail: data.params.detail
	})
)

Page('/:project/', data => 
	routerStore.set({
		project: data.params.project,
		view: data.params.view,
		subview: data.params.subview,
		detail: data.params.detail
	})
)

Page('/:project/:view/', data => 
	routerStore.set({
		project: data.params.project,
		view: data.params.view,
		subview: data.params.subview || '-',
		detail: data.params.detail
	})
)

Page('/:project/:view/:subview/', data =>
	routerStore.set({
		project: data.params.project,
		view: data.params.view,
		subview: data.params.subview,
		detail: data.params.detail
	})
)

Page('/:project/:view/:subview/:detail/', data =>
	routerStore.set({
		project: data.params.project,
		view: data.params.view,
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