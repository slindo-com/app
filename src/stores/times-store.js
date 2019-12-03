import { writable, get } from 'svelte/store'
import { routerStore } from '../stores/router-store.js'
import { authStore } from '../stores/auth-store.js'
import { teamStore } from '../stores/team-store.js'
import { projectsStore } from '../stores/projects-store.js'
import { sws } from '../helpers/sws-client.js'
import { dateToDatabaseDate, dateStringToDate } from '../helpers/helpers.js'

export const timesStore = writable({
	dates: {},
	times: {},
	detailTime: null
})


let listener,
	day = dateToDatabaseDate(new Date()),
	teamId = null,
	projectId = null,
	detailId = null


export function timesStoreInit() {
	teamStore.subscribe(teamData => {
		if(teamData.active && teamData.active.id != teamId) {
			teamId = teamData.active.id
			setListener(teamId, projectId, day)
		}
	})

	projectsStore.subscribe(projectsData => {
		if(projectsData.active && projectsData.active.id != projectId) {
			projectId = projectsData.active.id
			setListener(teamId, projectId, day)
		}
	})

	routerStore.subscribe(routerData => {
		if(routerData.view === 'tasks' && routerData.detail && routerData.detail != detailId) {
			detailId = routerData.detail
			setDetailTime()
		}
	})

	// TODO: Project Times
}


function setListener(teamId, projectId, day) {

	if(teamId) {

		let query = {
			team: teamId,
			day
		}

		sws.db.query({
			col: 'times',
			query
		}).then(res => {
			timesStore.update(data => {
				data.dates[day] = res
				res.forEach(val => data.times[val.id] = val)
				return data
			})

			setDetailTime()
		})

		sws.db.hook({
			hook: 'timesStore-'+day,
			col: 'times',
			query,
			fn: obj => {
				timesStore.update(data => {

					if(obj.__deleted) {
						delete data.times[obj.id]
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

						data.times[obj.id] = obj
					}

					setDetailTime()

					return data
				})
			}
		})
	}
}


export function timesStoreObserveNewDay(day) {
	setListener(teamId, projectId, dateToDatabaseDate(day))
}


function setDetailTime() {
	const { times } = get(timesStore)

	const detailTime = times[detailId]

	timesStore.update(data => {
		data.detailTime = detailTime
		return data
	})
}


export async function timesStoreNewTime(project, dayForNewTime) {

	const { user } = get(authStore)

	return sws.db.new({
		col: 'times',
		data: {
			user: user.id,
			team: teamId,
			project,
			day: dateToDatabaseDate(dayForNewTime)
		}
	})
}


export function timesStoreChangeAttributes(id, data) {
	sws.db.update({
		col: 'times',
		id,
		data
	})
}

