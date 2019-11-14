import { timesStoreDeleteEntry } from '../stores/times-store.js'

const TO_MAIN_NAV = [
	['parent', 'body'],
	['query', 'nav .active']
]

const NAV_LEFT = [
	['parent', 'li'], 
	['prev'], 
	['find']
]

const NAV_RIGHT = [
	['parent', 'li'], 
	['next'], 
	['find']
]

const TO_ENTRIES = [
	['parent', 'body'],
	['query', '.entries, .container'],
	['find']
]

const TO_PARENT_LI = [
	['parent', 'li']
]

const DELETE_TIMELOG_ENTRY = e => {
	timesStoreDeleteEntry(e.target.closest('li').dataset.id)
}

export const KEYS_CONFIG = {

	EMPTY: {},

	MAIN_NAV: {
		'box-x': 6,
		'box-y': 6,
		'box-width': -12,
		'box-height': -12,
		'left': NAV_LEFT,
		'right': NAV_RIGHT,
		'bottom': [
			['parent', 'body'],
			['query', '.spacer + *'],
			['find']
		]
	},


	SUB_NAV: {
		'box-x': 6,
		'box-y': 6,
		'box-width': -12,
		'box-height': -12,
		'top': TO_MAIN_NAV,
		'left': NAV_LEFT,
		'right': NAV_RIGHT,
		'bottom': [
			['parent', 'body'],
			['query', 'header'],
			['find']
		],
		'esc': TO_MAIN_NAV
	},


	TIMELOG_HEADER_ARROW_LEFT: {
		'top': TO_MAIN_NAV,
		'right': [
			['parent', 'div'],
			['next'],
			['find']
		],
		'bottom': TO_ENTRIES,
		'esc': TO_MAIN_NAV
	},

	TIMELOG_HEADER_ARROW_RIGHT: {
		'top': TO_MAIN_NAV,
		'left': [
			['parent', 'div'],
			['prev'],
			['find']
		],
		'right': [
			['parent', 'body'],
			['query', '.add-button-wrapper a']
		],
		'bottom': TO_ENTRIES,
		'esc': TO_MAIN_NAV
	},


	TIMELOG_HEADER_ADD: {
		'top': TO_MAIN_NAV,
		'left': [
			['parent', 'header'],
			['query', '.button-wrapper + .button-wrapper a']
		],
		'bottom': TO_ENTRIES,
		'esc': TO_MAIN_NAV
	},


	TIMELOG_ENTRY: {
		'top': [
			['prev']
		],
		'bottom': [
			['next']
		],
		'left': [
			['query', '.nav a']
		],
		'right': [
			['find']
		],
		'enter': [
			['find']
		],
		'esc': TO_MAIN_NAV,
		'backspace': e => {
			timesStoreDeleteEntry(e.target.dataset.id)
		}
	},

	TIMELOG_ENTRY__TO_ADD: [
		['parent', 'body'],
		['query', '.add-button-wrapper a']
	],

	TIMELOG_ENTRY_STOPWATCH: {
		'top': [
			['parent', 'li'],
			['prev'],
			['query', '.stopwatch a']
		],
		'bottom': [
			['parent', 'li'],
			['next'],
			['query', '.stopwatch a']
		],
		'left': TO_PARENT_LI,
		'right': [
			['parent', '.stopwatch'],
			['next']
		],
		'esc': TO_PARENT_LI,
		'backspace': DELETE_TIMELOG_ENTRY
	},

	TIMELOG_ENTRY_DURATION: {
		'box-x': 3,
		'box-width': -6,
		'box-y': 3,
		'box-height': -6,
		'top': [
			['parent', 'li'],
			['prev'],
			['query', '.duration']
		],
		'bottom': [
			['parent', 'li'],
			['next'],
			['query', '.duration']
		],
		'left': [
			['prev'],
			['find']
		],
		'right': [
			['next']
		],
		'esc': TO_PARENT_LI,
		'backspace': DELETE_TIMELOG_ENTRY
	},

	TIMELOG_ENTRY_TASK: {
		'box-x': 3,
		'box-width': -6,
		'box-y': 3,
		'box-height': -6,
		'top': [
			['parent', 'li'],
			['prev'],
			['query', '.task']
		],
		'bottom': [
			['parent', 'li'],
			['next'],
			['query', '.task']
		],
		'left': [
			['prev']
		],
		'right': [
			['next']
		],
		'esc': TO_PARENT_LI,
		'backspace': DELETE_TIMELOG_ENTRY
	},

	TIMELOG_ENTRY_COMMENT: {
		'box-x': 0,
		'box-width': -48,
		'box-y': 3,
		'box-height': -6,
		'top': [
			['parent', 'li'],
			['prev'],
			['query', '.comment']
		],
		'bottom': [
			['parent', 'li'],
			['next'],
			['query', '.comment']
		],
		'left': [
			['prev']
		],
		'right': [
			['next'],
			['find']
		],
		'esc': TO_PARENT_LI,
		'backspace': DELETE_TIMELOG_ENTRY
	},

	TIMELOG_ENTRY_CONEXTNAV: {
		'top': [
			['parent', 'li'],
			['prev'],
			['query', '.nav a']
		],
		'bottom': [
			['parent', 'li'],
			['next'],
			['query', '.nav a']
		],
		'left': [
			['parent', '.nav'],
			['prev']
		],
		'right': TO_PARENT_LI,
		'esc': TO_PARENT_LI,
		'backspace': DELETE_TIMELOG_ENTRY
	},

	TIMELOG_EMPTY_STATE_LINK: {
		'top': [
			['parent', 'body'],
			['query', '.add-button-wrapper a']
		]
	},



	REPORTS_RANGE_ARROW_LEFT: {
		'top': TO_MAIN_NAV,
		'right': [
			['next']
		],
		'bottom': [
			['parent', 'section'],
			['next'],
			['find']
		],
		'esc': TO_MAIN_NAV
	},

	REPORTS_RANGE_ARROW_RIGHT: {
		'top': TO_MAIN_NAV,
		'right': [
			['next']
		],
		'bottom': [
			['parent', 'section'],
			['next'],
			['find']
		],
		'left': [
			['prev']
		],
		'esc': TO_MAIN_NAV
	},

	REPORTS_RANGE_TITLE: {
		'top': TO_MAIN_NAV,
		'right': [
			['parent', '.custom-range-wrapper'],
			['next'],
			['find']
		],
		'bottom': [
			['parent', 'section'],
			['next'],
			['find']
		],
		'left': [
			['prev']
		],
		'esc': TO_MAIN_NAV
	},

	REPORTS_RANGE_RADIO: {
		'top': TO_MAIN_NAV,
		'right': [
			['next']
		],
		'bottom': [
			['parent', 'section'],
			['next'],
			['find']
		],
		'left': [
			['prev']
		],
		'esc': TO_MAIN_NAV
	},

	REPORTS_RANGE_RADIO_FIRST: [
		['parent', 'section'],
		['query', '.custom-range-wrapper .title']
	],

	REPORTS_MULTIPLE: {
		'top': [
			['parent', 'section'],
			['prev'],
			['find']
		],
		'esc': TO_MAIN_NAV
	}
}