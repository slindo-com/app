import { writable, get } from 'svelte/store'
import { routerStore } from '../stores/router-store.js'
import { authStore } from '../stores/auth-store.js'
import { teamStore } from '../stores/team-store.js'
import { sws } from '../helpers/sws-client.js'
import { dateToDatabaseDate, dateStringToDate } from '../helpers/helpers.js'

export const commentsStore = writable({
	tasks: [],
	detailTask: null
})


let listener,
	teamId = null,
	detailId = null


export function commentsStoreInit() {

}




export async function commentsStoreGetComments(type, asset) {
	return sws.db.query({
		col: 'comments',
		query: {
			type,
			asset
		}
	})
}


export async function commentsStoreNewComment(type, asset, comment) {

	const { user } = get(authStore),
		teamData = get(teamStore)

	return sws.db.new({
		col: 'comments',
		data: {
			user: user.id,
			team: teamData.active.id,
			type,
			asset,
			comment
		}
	})
}