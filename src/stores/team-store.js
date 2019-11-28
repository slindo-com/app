import { writable, get } from 'svelte/store';
import { routerStore } from '../stores/router-store.js'
import { authStore } from '../stores/auth-store.js'
import { sws } from '../helpers/sws-client.js'

export const teamStore = writable({
	teams: {},
	active: null
})

export const membersStore = writable({})

let listenerMember,
	listenerAdmin,
	listener = {},
	invitationListener,
	interval,
	teamId

export function teamStoreInit() {
	setListener()

	teamStore.subscribe(teamData => {
		if(teamData.active && teamData.active.id != teamId) {
			teamId = teamData.active.id
			setMembersListener(teamId)
		}
	})
}


function setListener() {
	sws.auth.hookIntoTeamState(teams => {
		teams = teams ? teams : {}
		teamStore.update(data => {
			data.teams = teams
			data.active = Object.values(teams)[0]
			return data
		})
	})
}


function setMembersListener() {
	if(teamId) {
		sws.db.query({
			col: 'members',
			query: {
				team: teamId
			}
		}).then(res => {
			membersStore.update(data => {

				if(data) {
					res.forEach(val => {
						data[val.id] = val
					})
				}
				return data
			})
		})

		sws.db.hook({
			hook: 'teamStore',
			col: 'members',
			query: {
				team: teamId
			},
			fn: obj => {
				membersStore.update(data => {
					data[obj.id] = obj
					return data
				})
			}
		})
	}
}


export function teamStoreGetUser(id) {
	const membersData = get(membersStore)
	return membersData[id]
}


export function teamStoreChangeTitle(id, title) {
	sws.auth.setTeamTitle({
		id,
		title
	})
}


function setInvitationListener() {
	// TODO
}


export function teamStoreInvite(email, name) {
	const teamData = get(teamStore)

	sws.auth.inviteMember({
		teamId: teamData.active.id,
		email,
		name
	})
}


export function teamStoreUpdateUser(id, data) {

	const { user } = get(authStore),
		teamData = get(teamStore),
		membersData = get(membersStore)

	if(membersData[id]) {
		console.log('UPDATE', data)
		return sws.db.update({
			col: 'members',
			id,
			data: {
				firstname: data.firstname,
				lastname: data.lastname
			}
		})		
	} else {
		console.log('NEW')
		return sws.db.new({
			id,
			col: 'members',
			data: {
				firstname: data.firstname,
				lastname: data.lastname,
				team: teamId,
				user: user.id
			}
		})	
	}


}
