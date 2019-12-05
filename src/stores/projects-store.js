import { writable, get } from 'svelte/store';
import { routerStore } from '../stores/router-store.js'
import { authStore } from '../stores/auth-store.js'
import { teamStore } from '../stores/team-store.js'
import { sws } from '../helpers/sws-client.js'

export const projectsStore = writable({
	projectsJson: {},
	projects: [],
	active: null
})

let listenerMember,
	listenerAdmin,
	listener = {},
	invitationListener,
	interval,

	teamId,
	projectCode

export function projectsStoreInit() {
	teamStore.subscribe(teamData => {
		if(teamData.active && teamData.active.id != teamId) {
			teamId = teamData.active.id
			setListener(teamId)
		}
	})

	routerStore.subscribe(routerData => {
		if(routerData.project && routerData.project != projectCode) {
			projectCode = routerData.project
			setActiveProject()
		}
	})
}


function setListener(teamId) {

	if(teamId) {
		sws.db.query({
			col: 'projects',
			query: {
				team: teamId
			}
		}).then(res => {
			projectsStore.update(data => {
				data.projects = res
				res.forEach(val => data.projectsJson[val.id] = val)
				return data
			})

			setActiveProject()
		})

		sws.db.hook({
			hook: 'projectsStore',
			col: 'projects',
			query: {
				team: teamId
			},
			fn: obj => {
				projectsStore.update(data => {

					if(obj.__deleted) {
						delete data.projectsJson[obj.id]
						data.projects = data.projects.filter(val => val.id != obj.id)
					} else {
						let found = false
						data.projects = data.projects.map(val => {
							if(val.id === obj.id) {
								found = true
								return obj
							} 
							return val
						})

						if(!found) {
							data.projects.push(obj)
						}

						data.projectsJson[obj.id] = obj
					}

					return data
				})

				setActiveProject()
			}
		})
	}
}


function setActiveProject() {

	const projectsData = get(projectsStore),
		newActiveProject = projectsData.projects.find(val => val.code === projectCode)

	if(JSON.stringify(newActiveProject) != JSON.stringify(projectsData.active)) {
		projectsStore.update(data => {
			data.active = newActiveProject
			return data
		})
	}
}


export function projectsStoreNewProject() {

	const { user } = get(authStore)

	return sws.db.new({
		col: 'projects',
		data: {
			user: user.id,
			team: teamId
		}
	})
}


export function projectsStoreChangeTitle(id, title) {
	sws.db.update({
		col: 'projects',
		id,
		data: {
			title
		}
	})
}


export function projectsStoreChangeCode(id, code) {
	sws.db.update({
		col: 'projects',
		id,
		data: {
			code
		}
	})
}