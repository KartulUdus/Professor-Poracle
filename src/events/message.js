module.exports = (client, msg) => {
	// Ignore all bots
	if (msg.author.bot) return

	// Ignore msgs not starting with the prefix (in config)
	if (!msg.content.startsWith(client.config.discord.prefix)) return

	let args = msg.content.slice(client.config.discord.prefix.length).trim().split(/ +/g)
	args = args.map(arg => arg.toLowerCase()).map(arg => arg.replace(/_/, ' '))
	const command = args.shift().toLowerCase()
	const cmd = client.commands.get(command)
	if (!cmd) return

	cmd.run(client, msg, args)
}