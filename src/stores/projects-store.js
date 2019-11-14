import { writable, get } from 'svelte/store';
import { authStore } from '../stores/auth-store.js'
import { teamStore } from '../stores/team-store.js'
import { sws } from '../helpers/sws-client.js'

export const projectsStore = writable({
	projects: [],
	active: null
})

let listenerMember,
	listenerAdmin,
	listener = {},
	invitationListener,
	interval,

	teamId

export function projectsStoreInit() {
	teamStore.subscribe(teamData => {
		if(teamData.active && teamData.active.id != teamId) {
			teamId = teamData.active.id
			setListener(teamId)
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
				return data
			})
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
					}

					return data
				})
			}
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
	console.log({
		col: 'projects',
		id,
		data: {
			title
		}
	})
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