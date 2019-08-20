const fetch = require('node-fetch')
const pokemonGif = require('pokemon-gif')
const typeData = require('../../config/types.json')
exports.run = async (client, msg, args) => {
	
	const formNames = args.filter(arg => arg.match(/form\S/gi)).map(arg => arg.replace('form', ''))

	try {
		// find the target pokemon
		monsters = formNames.length ? 
		Object.values(client.monsters)
			.filter(mon => (args.includes(mon.name.toLowerCase()) || args.includes(mon.id.toString())) && formNames.includes(mon.form.name.toLowerCase()))
		:
		Object.values(client.monsters).filter(mon => (args.includes(mon.name.toLowerCase()) || args.includes(mon.id.toString())) && mon.form.id === 0)

		// limit responces to 3 pokeman
		if (monsters.length > 3) monsters = monsters.slice(0, 3)

		let atk = 15
		let def = 15
		let sta = 15
		let level = 40

		args.forEach(arg => {
			if (arg.match(/atk\d{1,2}/gi)) atk = +(arg.match(/atk\d{1,2}/gi)[0].replace(/atk/gi, ''))
			else if (arg.match(/def\d{1,2}/gi)) def = +(arg.match(/def\d{1,2}/gi)[0].replace(/def/gi, ''))
			else if (arg.match(/sta\d{1,2}/gi)) sta = +(arg.match(/sta\d{1,2}/gi)[0].replace(/sta/gi, ''))
			else if (arg.match(/level\d{1,2}/gi)) level = +(arg.match(/level\d{1,2}/gi)[0].replace(/level/gi, ''))

		})

		client.asyncForEach(monsters, async (mon) => {
			let { description, art_url } = client.descriptions.find(desc => desc.pkdx_id === mon.id)
			description = description ? description : ''
			art_url = art_url ? art_url : ''
			let types = mon.types.map(type => type.name)
			let typeString = mon.types.map(type => `${typeData[type.name].emoji} ${type.name}`)
			const allWeakness = client.pokeTypes.getTypeWeaknesses.apply(null, types)
			let allStrenght = {}
			let superEffective = []
			let ultraEffective = []
			let superWeakness = []
			let ultraWeakness = []

			types.forEach(type => {
				let strengths = client.pokeTypes.getTypeStrengths(type)
				Object.keys(strengths).forEach(type => {
					if(strengths[type] > allStrenght[type] || !allStrenght[type]) allStrenght[type] = strengths[type]
				})
			})

			imgurl = `https://raw.githubusercontent.com/whitewillem/PogoAssets/resized/no_border/pokemon_icon_${mon.id.toString().padStart(3, '0')}_${mon.form.id ? mon.form.id.toString() : '00'}.png`
			imgurlRes = await fetch(imgurl)
			for( let type in allStrenght) {
				let capType = client.capitalize(type)
				if (allStrenght[type] === 2) superEffective.push(`${typeData[capType]? typeData[capType].emoji : ''} ${capType}`)
				if (allStrenght[type] > 2) ultraEffective.push(`${typeData[capType]? typeData[capType].emoji : ''} ${capType}`)
			}

			for (let type in allWeakness) {
				let capType = client.capitalize(type)
				if (allWeakness[type] === 2) superWeakness.push(`${typeData[capType]? typeData[capType].emoji : ''} ${capType}`)
				if (allWeakness[type] > 2) ultraWeakness.push(`${typeData[capType]? typeData[capType].emoji : ''} ${capType}`)

			}

			let gifurl = ''
			try {
				gifurl = pokemonGif(Number(mon.id))
			} catch(e) {
				console.log(`pokeGif couldn't pull a gif for #${mon.id}: ${e.message}`)
			}

			const cp = client.monsterUtils.calculateCp(mon, level, atk, def, sta)

			const view = {
				name: mon.name,
				imageurl: imgurlRes.status === 200 ? imgurl : art_url,
				id: mon.id,
				gifurl: gifurl,
				type: typeString.join(', '),
				color: mon.types[0].color,
				description,
				superWeak: superWeakness.join(', '),
				ultraWeak: ultraWeakness.join(', '),
				superStrong: superEffective.join(', '),
				ultraStrong: ultraEffective.join(', '),
				baseAtk: mon.stats.baseAttack,
				baseDef: mon.stats.baseDefense,
				baseSta: mon.stats.baseStamina,
				atk,
				def,
				sta,
				cp,
				level
			}

			const template = JSON.stringify(client.dts.monster)
			const message = client.mustache.render(template, view)
			msg.reply(JSON.parse(message))
			console.log(`${msg.author.username} requested info on ${mon.name}`)

		})
		
	} catch (err) {
		console.error('Pokedex command unhappy:', err)
	}
}