const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const Discord = require('discord.js')
const mustache = require('mustache')
const pokemonGif = require('pokemon-gif')
const pokeTypes = require('poke-types')
const config = require('config')

const monsterData = require('./util/monsters')
const descriptions = require('./util/description')
const dts = require('./util/message')

const client = new Discord.Client()
const baseStats = require('./util/base_stats')
const monsterUtils = require('./util/monster_utils')

if (!fs.existsSync(path.join(__dirname, '../config/types.json'))) {
	const emergTypesConf = fs.readFileSync(path.join(__dirname, '../config/types.json.example'), 'utf8')
	fs.writeFileSync(path.join(__dirname, '../config/types.json'), emergTypesConf)
}

const typeConstants = require('../config/types')

client.on('ready', () => {
	console.log(`Discord botto "${client.user.tag}" ready for action!`)
})

client.login(config.discord.token)

client.on('message', (msg) => {

	if (msg.content.startsWith(`${config.discord.prefix}cp `)) {
		const rawArgs = msg.content.slice(`${config.discord.prefix}cp`.length).split(' ')
		const args = rawArgs.join('|').toLowerCase().split('|')

		let monster = -1
		let level = 40
		const iv = [15, 15, 15]
		const minIv = [0, 0, 0]

		// Special handling of Alolan pokemen
		const isAlola = msg.content.toLowerCase().indexOf('alolan') !== -1

		let setIv = false

		args.forEach((element) => {
			if (element.toLowerCase().startsWith('lvl')) {
				if (!isNaN(element.substring(3).replace(',', '.'))) {
					level = parseFloat(element.substring(3).replace(',', '.'))

					if (level > 40) level = 40
					if (level < 1) level = 1
					return
				}
			}

			if (element.indexOf('/') !== -1) {
				// ivs
				const ivSplit = element.split('/')
				if (ivSplit.length === 3 && !isNaN(ivSplit[0])
                    && !isNaN(ivSplit[1]) && !isNaN(ivSplit[2])) {

					if (setIv) {
						iv[0] = parseInt(ivSplit[0])
						iv[1] = parseInt(ivSplit[1])
						iv[2] = parseInt(ivSplit[2])
					}
					else {
						minIv[0] = parseInt(ivSplit[0])
						minIv[1] = parseInt(ivSplit[1])
						minIv[2] = parseInt(ivSplit[2])
						setIv = true
					}
				}
				return
			}

			if (element === 'alolan') {
				return
			}

			const pid = isAlola
				? _.findKey(monsterData, mon => mon.name.toLowerCase() === (`alolan ${element}`))
				: _.findKey(monsterData, mon => mon.name.toLowerCase() === element)
			if (pid !== undefined) monster = pid
		})


		if (monster === -1) {
			msg.reply(`Example usage: \`${config.discord.prefix}cp pokemon lvl10 [min attack/defense/stamina] [max attack/defense/stamina]\``)
			return
		}

		const { name } = monsterData[monster]
		console.log(`${msg.author.username} requested info on ${name}`)

		min_cp = monsterUtils.calculateCp(monster, level, minIv[0], minIv[1], minIv[2])
		max_cp = monsterUtils.calculateCp(monster, level, iv[0], iv[1], iv[2])

		msg.reply(`CP range of a level ${level} **${name}** is **${min_cp}** (${minIv[0]}/${minIv[1]}/${minIv[2]}) - **${max_cp}** (${iv[0]}/${iv[1]}/${iv[2]})`)
	}
	else if (msg.content.startsWith(`${config.discord.prefix}pokedex `) || msg.content.startsWith(`${config.discord.prefix}dex `)) {

		const rawArgs = msg.content.startsWith(`${config.discord.prefix}pokedex `)
			? msg.content.slice(`${config.discord.prefix}pokedex`.length).split(' ')
			: msg.content.slice(`${config.discord.prefix}dex`.length).split(' ')
		const args = rawArgs.join('|').toLowerCase().split('|')
		const monsters = []
		args.forEach((element) => {
			const pid = _.findKey(monsterData, mon => mon.name.toLowerCase() === element)
			if (pid !== undefined) monsters.push(pid)
			if (!isNaN(element) && parseInt(element, 10) < 810) monsters.push(parseInt(element, 10))
		})


		monsters.forEach((monster) => {
			console.log(typeof monster)
			let description = _.find(descriptions, (o) => {return o.pkdx_id === monster})
			if (!description) {
				msg.reply(`I don't know anything about ${monsterData[monster].name}`)
				return
			}

			let imageurl = `${config.discord.lowimageurl}${monster}.png`

			if (monster > config.discord.maxlow) imageurl = description.art_url
			const types = []
			monsterData[monster].types.forEach((type) => {
				types.push(`${type.type}`)
			})
			const allWeakness = pokeTypes.getTypeWeaknesses.apply(null, types)
			const allStrenght = pokeTypes.getTypeStrengths.apply(null, types)
			let gifurl = ''
			try {
				gifurl = pokemonGif(Number(monster))
			} catch(e) {
				console.log(`pokeGif couldn't pull a gif for #${monster}: ${e.message}`)
			}

			const { name } = monsterData[monster]
			const weakness = []
			const strength = []

			_.forEach(allWeakness, (value, key) => {
				if (value >= 2) {
					weakness.push(key)
				}
			})
			_.forEach(allStrenght, (value, key) => {
				if (value >= 2) {
					strength.push(key)
				}
			})

			const data = description.description

			const min_cp_15 = monsterUtils.calculateCp(monster, 15, 10, 10, 10)
			const max_cp_15 = monsterUtils.calculateCp(monster, 15, 15, 15, 15)
			const min_cp_20 = monsterUtils.calculateCp(monster, 20, 10, 10, 10)
			const max_cp_20 = monsterUtils.calculateCp(monster, 20, 15, 15, 15)
			const min_cp_25 = monsterUtils.calculateCp(monster, 25, 10, 10, 10)
			const max_cp_25 = monsterUtils.calculateCp(monster, 25, 15, 15, 15)
			const min_cp_40 = monsterUtils.calculateCp(monster, 40, 10, 10, 10)
			const max_cp_40 = monsterUtils.calculateCp(monster, 40, 15, 15, 15)


			const view = {
				name: name,
				imageurl: imageurl,
				id: monster,
				gifurl: gifurl,
				type: types,
				color: typeConstants[monsterData[monster].types[0].type].color,
				cp15: max_cp_15,
				cp20: max_cp_20,
				cp25: max_cp_25,
				cp40: max_cp_40,
				mincp15: min_cp_15,
				mincp20: min_cp_20,
				mincp25: min_cp_25,
				mincp40: min_cp_40,
				description: data,
				weak: weakness,
				strong: strength,
				atk: baseStats[monster].attack,
				def: baseStats[monster].defense,
				sta: baseStats[monster].stamina
			}

			const e = []
			monsterData[monster].types.forEach((type) => {
				e.push(typeConstants[type.type].emoji)
			})

			const template = JSON.stringify(dts.monster)
			const message = mustache.render(template, view)
			msg.reply(JSON.parse(message)).then((msg) => {
				e.forEach((emoji) => {
					if (emoji.match(/:\d+>/gi)) { // If the emoji is a string matching discord custom emoji, fetch it before reacting
						emoji = emoji.match(/:\d+>/gi)[0].replace(/[:>]/g, '')
						emoji = client.emojis.get(emoji)
					}
					msg.react(emoji)
				})

			})

			console.log(`${msg.author.username} requested info on ${name}`)

		})
	}
})
