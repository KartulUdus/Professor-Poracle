const _ = require('lodash');
const Discord = require('discord.js');
const monsterData = require('./monsters');
const cpData = require('./raidcp');
const descriptions = require('./description');
const dts = require('./message');
const client = new Discord.Client();
const mustache = require('mustache');
const pokemonGif = require('pokemon-gif');
const pokeTypes = require('poke-types');
const baseStats = require('./base_stats');
const config = require('config');


client.on('ready', () => {
    console.log(`Discord botto "${client.user.tag}" ready for action!`);
});

client.login(config.discord.token);

client.on('message', (msg) => {

    if (msg.content.startsWith(`${config.discord.prefix}pokedex `)) {

        const rawArgs = msg.content.slice(`${config.discord.prefix}pokedex`.length).split(' ');
        const args = rawArgs.join('|').toLowerCase().split('|');
        let monsters = [];

        args.forEach((element) => {
            const pid = _.findKey(monsterData, mon => mon.name.toLowerCase() === element
            );
        if (pid !== undefined) monsters.push(pid);
        });

        monsters.forEach((monster) => {

            let imageurl = `${config.discord.lowimageurl}${monster}.png`;
            if (monster>config.discord.maxlow) imageurl = descriptions[monster - 1].art_url;
            let types = [];
            monsterData[monster].types.forEach((type) => {
                types.push(`${type.type}`)
            });
            let allWeakness = pokeTypes.getTypeWeaknesses.apply(null, types);
            let allStrenght = pokeTypes.getTypeStrengths.apply(null, types);
            let gifurl = pokemonGif(Number(monster));
            let name = monsterData[monster].name;
            let weakness = [];
            let strength = [];

            _.forEach(allWeakness, function(value,key){
                if(value>=2){
                    weakness.push(key);
                }
            });
            _.forEach(allStrenght, function(value,key){
                if(value>=2){
                    strength.push(key);
                }
            });

            let data = descriptions[monster - 1].description;

            let view = {
                name: name,
                imageurl: imageurl,
                id: monster,
                gifurl: gifurl,
                type: types,
                color: monsterData[monster].types[0].color,
                cp15: cpData[monster].max_cp_15,
                cp20: cpData[monster].max_cp_20,
                cp25: cpData[monster].max_cp_25,
                cp40: cpData[monster].max_cp_40,
                mincp15: cpData[monster].min_cp_15,
                mincp20: cpData[monster].min_cp_20,
                mincp25: cpData[monster].min_cp_25,
                mincp40: cpData[monster].min_cp_40,
                description: data,
                weak: weakness,
                strong: strength,
                atk:baseStats[monster].attack,
                def:baseStats[monster].defense,
                sta:baseStats[monster].stamina
            };

            const e = [];
            monsterData[monster].types.forEach((type) => {
                e.push(type.emoji);
            });

            const template = JSON.stringify(dts.monster);
            let message = mustache.render(template, view);
            msg.reply(JSON.parse(message)).then((msg) => {
                e.forEach((emoji) => {
                    msg.react(emoji);
                });

            });

            console.log(`${msg.author.username} requested info on ${name}`)

        })
    }
});


