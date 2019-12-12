import { writable, get } from 'svelte/store'
import { routerStore } from '../stores/router-store.js'
import { authStore } from '../stores/auth-store.js'
import { teamStore } from '../stores/team-store.js'
import { projectsStore } from '../stores/projects-store.js'
import { sws } from '../helpers/sws-client.js'
import { dateToDatabaseDate, dateStringToDate } from '../helpers/helpers.js'

export const messagesStore = writable({
	dates: {}
})


let listener,
	teamId = null,
	projectId = null


export function messagesStoreInit() {
	teamStore.subscribe(teamData => {
		if(teamData.active && teamData.active.id != teamId) {
			teamId = teamData.active.id

			let oldDates
			messagesStore.update(data => {
				oldDates = Object.keys(data.dates)
				//console.log(oldDates)
				data.dates = {}
				return data
			})

			oldDates.forEach(val =>
				setListener(teamId, projectId, val)
			)
		}
	})

	projectsStore.subscribe(projectsData => {
		if(projectsData.active && projectsData.active.id != projectId) {
			projectId = projectsData.active.id

			let oldDates
			messagesStore.update(data => {
				oldDates = Object.keys(data.dates)
				//console.log('OLD DATES', oldDates)
				data.dates = {}
				return data
			})

			oldDates.forEach(val =>
				setListener(teamId, projectId, val)
			)
		}
	})

	// TODO: Project Messages
}


function setListener(teamId, projectId, day) {

	if(teamId && projectId) {

		let query = {
			team: teamId,
			project: projectId,
			day: parseInt(day)
		}

		//console.log('QUERY', query)

		sws.db.query({
			col: 'messages',
			query
		}).then(res => {
			messagesStore.update(data => {
				data.dates[day] = res
				return data
			})
		})

		sws.db.hook({
			hook: 'messagesStore-'+day,
			col: 'messages',
			query,
			fn: obj => {
				messagesStore.update(data => {

					if(obj.__deleted) {
						if(data.dates[day]) {
							data.dates[day] = data.dates[date].filter(val => val.id != obj.id)
						}
					} else {

						if(!data.dates[day]) {
							data.dates[day] = []
						}

						let found = false
						data.dates[day] = data.dates[day].map(val => {
							if(val.id === obj.id) {
								found = true
								return obj
							} 
							return val
						})

						if(!found) {
							data.dates[day].push(obj)
						}
					}

					return data
				})
			}
		})
	} else {
		messagesStore.update(data => {
			data.dates[day] = []
			return data
		})
	}
}


export function messagesStoreObserveNewDay(day) {
	setListener(teamId, projectId, dateToDatabaseDate(day))
}


export async function messagesStoreNewMessage(project, dayForNewMessage, message) {

	const { user } = get(authStore)

	return sws.db.new({
		col: 'messages',
		data: {
			user: user.id,
			team: teamId,
			project,
			day: dateToDatabaseDate(dayForNewMessage),
			message
		}
	})
}
