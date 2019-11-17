const BLOCK = 'block',
	INLINE = 'inline',
	parseMap = [
	{
		// <div>
		pattern: /\n(?!<\/?\w+>|\s?\*|\s?[0-9]+|>|\&gt;|-{5,})([^\n]+)/g,
		replace: "<div>$1</div>",
		type: BLOCK,
	}, {
		// <strong>
		pattern: /(\*\*|__)(.*?)\1/g,
		replace: "<strong>$2</strong>",
		type: INLINE,
	}, {
		// <em>
		pattern: /(\*|_)(.*?)\1/g,
		replace: "<em>$2</em>",
		type: INLINE,
	}, {
		// <a>
		pattern: /([^!])\[([^\[]+)\]\(([^\)]+)\)/g,
		replace: "$1<a href=\"$3\">$2</a>",
		type: INLINE,
	}, {
		// <ul>
		pattern: /\n\s?\*\s*(.*)/g,
		replace: "<ul>\n\t<li>$1</li>\n</ul>",
		type: BLOCK,
	}, {
		// <ol>
		pattern: /\n\s?[0-9]+\.\s*(.*)/g,
		replace: "<ol>\n\t<li>$1</li>\n</ol>",
		type: BLOCK,
	}
]

const cleaningRules = [
	{
		match: /<\/([uo]l)>\s*<\1>/g,
		replacement: "",
	}, {
		match: /(<\/\w+>)<\/(blockquote)>\s*<\2>/g,
		replacement: "$1",
	}
]

export function toMarkdown(html) {
	html = html.replaceAll('<div>', '\n')
	html = html.replaceAll('</div>', '\n')
	html = html.replaceAll('<ul>', '\n')
	html = html.replaceAll('</ul>', '\n')
	html = html.replaceAll('</li>', '\n')
	html = html.replaceAll('<br>', '\n')

	html = html.replaceAll('<li>', '* ')

	html = html.replaceAll('<b>', '**')
	html = html.replaceAll('</b>', '**')
	html = html.replaceAll('<strong>', '**')
	html = html.replaceAll('</strong>', '**')

	html = html.replaceAll('<i>', '*')
	html = html.replaceAll('</i>', '*')
	html = html.replaceAll('<em>', '*')
	html = html.replaceAll('</em>', '*')


	html = html.replaceAll('&nbsp;', ' ')
	html = html.replaceAll('&lt;', '<')
	html = html.replaceAll('&gt;', '>')

	// html = (html.split('\n')).filter(val => val.length > 0).join('\n')

	return html
}


export function toHtml(markdown) {

	var output = '\n'+ markdown +'\n';

	parseMap.forEach(function(p) {
		output = output.replace(p.pattern, function() {
			return replace.call(this, arguments, p.replace, p.type);
		})
	})

	return clean(output)
}


function replace(matchList, replacement, type) {
	for(var i in matchList) {
		if(!matchList.hasOwnProperty(i)) {
			continue
		}

		replacement = replacement.split('$' + i).join(matchList[i])
		replacement = replacement.split('$L' + i).join(matchList[i].length)
	}

	if(type === BLOCK) {
		replacement = replacement.trim() + '\n'
	}

	return replacement
}


function clean(string) {

	cleaningRules.forEach(rule =>
		string = string.replace(rule.match, rule.replacement)
	)

	return string
}