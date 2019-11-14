import { writable, get } from 'svelte/store'
import { routerStore } from '../stores/router-store.js'
import { authStore } from '../stores/auth-store.js'
import { teamStore } from '../stores/team-store.js'
import { sws } from '../helpers/sws-client.js'
import { dateToDatabaseDate, dateStringToDate } from '../helpers/helpers.js'

export const tasksStore = writable({
	tasks: [],
	dayIndex: {}
})


let listener,
	teamId = null


export function tasksStoreInit() {
	teamStore.subscribe(teamData => {
		if(teamData.active && teamData.active.id != teamId) {
			teamId = teamData.active.id
			setListener(teamId)
		}
	})

	// TODO: Project Tasks
}


function setListener(teamId) {

	if(teamId) {
		sws.db.query({
			col: 'tasks',
			query: {
				team: teamId
			}
		}).then(res => {
			tasksStore.update(data => {
				data.tasks = res
				return data
			})
		})

		sws.db.hook({
			hook: 'tasksStore',
			col: 'tasks',
			query: {
				team: teamId
			},
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

					return data
				})
			}
		})
	}
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