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
		const routerData = get(routerStore)
		try {
			if(teamData.active && teamData.active.id != teamId) {
				teamId = teamData.active.id
				setListener(teamId)
			}
		} catch(err) {}		
	})
}


function setListener(teamId) {

	console.log(teamId)

	/*const authData = get(authStore)

	if(teamId) {

		sws.db.query({
			col: 'times',
			query: {
				day: dbDate,
				team: teamId
			}
		}).then(res => {
			tasksStore.update(data => {
				data.times = res.filter(entry => entry.user === authData.user.id)
				return data
			})
		})

		sws.db.hook({
			hook: 'times',
			col: 'times',
			query: {
				day: dbDate,
				team: teamId
			},
			fn: obj => {
				tasksStore.update(data => {

					if(obj.__deleted) {
						data.times = data.times.filter(val => val.id != obj.id)
					} else {
						let found = false
						data.times = data.times.map(val => {
							if(val.id === obj.id) {
								found = true
								return obj
							} 
							return val
						})

						if(!found) {
							data.times.push(obj)
						}
					}

					return data
				})
			}
		})
	}*/
}


export function tasksStoreNewTime(day, cb) {

	const { user } = get(authStore)

	sws.db.new({
		col: 'times',
		data: {
			user: user.id,
			team: teamId,
			day: day,
		}
	}).then(() => {
		cb(true)
	}).catch(err => {
		cb(false)
	})
}


export function tasksStoreGetEntry(id, cb) {
	sws.db.get({
		col: 'times',
		id
	}).then(obj => {
		cb(obj)
	}).catch(err => {
		cb(null)
	})
}


export function tasksStoreChangeComment(id, comment) {
	sws.db.update({
		col: 'times',
		id,
		data: {
			comment
		}
	})
}


export function tasksStoreChangeDuration(id, duration) {
	sws.db.update({
		col: 'times',
		id,
		data: {
			duration
		}
	})
}


export function tasksStoreChangeTask(id, task) {
	sws.db.update({
		col: 'times',
		id,
		data: {
			task
		}
	})
}


export function tasksStoreDeleteEntry(id) {
	sws.db.delete({
		col: 'times',
		id
	})
}