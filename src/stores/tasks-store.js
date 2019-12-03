import { writable, get } from 'svelte/store'
import { routerStore } from '../stores/router-store.js'
import { authStore } from '../stores/auth-store.js'
import { teamStore } from '../stores/team-store.js'
import { projectsStore } from '../stores/projects-store.js'
import { sws } from '../helpers/sws-client.js'
import { dateToDatabaseDate, dateStringToDate } from '../helpers/helpers.js'

export const tasksStore = writable({
	tasks: [],
	detailTask: null
})


let listener,
	teamId = null,
	projectId = null,
	detailId = null


export function tasksStoreInit() {
	teamStore.subscribe(teamData => {
		if(teamData.active && teamData.active.id != teamId) {
			teamId = teamData.active.id
			setListener(teamId, projectId)
		}
	})

	projectsStore.subscribe(projectsData => {
		if(projectsData.active && projectsData.active.id != projectId) {
			projectId = projectsData.active.id
			setListener(teamId, projectId)
		}
	})

	routerStore.subscribe(routerData => {
		if(routerData.view === 'tasks' && routerData.detail && routerData.detail != detailId) {
			detailId = routerData.detail
			setDetailTask()
		}
	})

	// TODO: Project Tasks
}


function setListener(teamId, projectId) {

	if(teamId) {

		let query = {
			team: teamId
		}

		if(projectId) {
			query.project = projectId
		}

		sws.db.query({
			col: 'tasks',
			query
		}).then(res => {
			tasksStore.update(data => {
				data.tasks = res
				return data
			})

			setDetailTask()
		})

		sws.db.hook({
			hook: 'tasksStore',
			col: 'tasks',
			query,
			fn: obj => {
				tasksStore.update(data => {

					if(obj.__deleted) {
						data.tasks = data.tasks.filter(val => val.id != obj.id)
					} else {
						let found = false
						data.tasks = data.tasks.map(val => {
							if(val.id === obj.id) {
								found = true
								return obj
							} 
							return val
						})

						if(!found) {
							data.tasks.push(obj)
						}
					}

					setDetailTask()

					return data
				})
			}
		})
	}
}


function setDetailTask() {
	const { tasks } = get(tasksStore)

	const detailTask = tasks.find(val => val.id === detailId)

	tasksStore.update(data => {
		data.detailTask = detailTask
		return data
	})
}


export async function tasksStoreNewTask(project) {

	const { user } = get(authStore)

	return sws.db.new({
		col: 'tasks',
		data: {
			user: user.id,
			team: teamId,
			project
		}
	})
}


export function tasksStoreChangeAttributes(id, data) {
	sws.db.update({
		col: 'tasks',
		id,
		data
	})
}

