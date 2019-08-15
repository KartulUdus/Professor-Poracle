require('./util/configFileCreator')()
const { Client } = require('discord.js')
const path = require('path')
const Enmap = require('enmap')
const fs = require('fs')
const mustache = require('mustache')
const pokemonGif = require('pokemon-gif')
const pokeTypes = require('poke-types')
const Config = require('./util/configFetcher')

let { config } = Config()
const tokenPattern = /[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}/g
let askToken = require('./util/askToken')
const { promisify } = require('util')
const readFileAsync = promisify(fs.readFile)

const monsters = require('./util/monsters')
const descriptions = require('./util/description')
const dts = require('./util/message')
const client = new Client()
const monsterUtils = require('./util/monster_utils')


async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
	  await callback(array[index], index, array)
	}
  }

function capitalize (s) {
    if (typeof s !== 'string') return ''
    s = s.replace(/_/gi, ' ').toLowerCase()
    return s.charAt(0).toUpperCase() + s.slice(1)
}

async function main () {

	
	fs.watch('./config/', async (event, fileName) => {
		const newFile = await readFileAsync(`./config/${fileName}`, 'utf8')
		try {
			JSON.parse(newFile)
			let { config } = Config()
			client.config = config
		} catch (err) {
			console.warn('new config file unhappy', err)
		}
	})
	
	
	if(!config.discord.token.match(tokenPattern)) {
		await askToken(config)
	}
	
	client.config = config
	client.dts = dts
	client.mustache = mustache
	client.monsters = monsters
	client.descriptions = descriptions
	client.pokeTypes = pokeTypes
	client.monsterUtils = monsterUtils 
	client.asyncForEach = asyncForEach
	client.capitalize = capitalize
	
	fs.readdir(`${__dirname}/events/`, (err, files) => {
		if (err) return log.error(err)
		files.forEach((file) => {
			const event = require(`${__dirname}/events/${file}`) // eslint-disable-line global-require
			const eventName = file.split('.')[0]
			client.on(eventName, event.bind(null, client))
		})
	})
	
	
	client.commands = new Enmap()
	const enabledCommands = []
	fs.readdir(`${__dirname}/commands/`, (err, files) => {
		if (err) return log.error(err)
		files.forEach((file) => {
			if (!file.endsWith('.js')) return
			const props = require(`${__dirname}/commands/${file}`) // eslint-disable-line global-require
			const commandName = file.split('.')[0]
			enabledCommands.push(`${config.discord.prefix}${commandName}`)
			client.commands.set(commandName, props)
			if(commandName === 'pokedex'){
				enabledCommands.push(`${config.discord.prefix}dex`)
				client.commands.set('dex', props)
			}
		})
	
	
		console.log('Loading discord commands: ', enabledCommands.join(' '))
	})
	
	client.login(config.discord.token)
		.catch((err) => {
			console.error('Discord commando unhappy', err)
			process.exit()
		})

}

main ()
