module.exports = (client) => {
	console.log(`Commando "${client.user.tag}" awaiting for orders!`)
	client.user.setPresence({
		game: {
			name: 'Professor Poracle',
		},
	})
}