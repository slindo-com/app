import { writable, get } from 'svelte/store';
import { routerStore } from '../stores/router-store.js'
import { authStore } from '../stores/auth-store.js'
import { sws } from '../helpers/sws-client.js'

export const teamStore = writable({
	teams: {},
	active: null
})

let listenerMember,
	listenerAdmin,
	listener = {},
	invitationListener,
	interval

export function teamStoreInit() {
	setListener()
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


export function teamStoreGetUser(id) {
	const teamData = get(teamStore)

	if(!teamData.active) {
		return null
	}

	const user = teamData.active.users.find(val => val.id === id)
	return user
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


export function teamStoreUpdateUser(id, name) {
	const teamData = get(teamStore)

	sws.auth.updateMember({
		teamId: teamData.active.id,
		id,
		name
	})	
}
