const _ = require('lodash');
const Discord = require('discord.js');
const monsterData = require('./monsters');
const descriptions = require('./description');
const dts = require('./message');
const client = new Discord.Client();
const mustache = require('mustache');
const pokemonGif = require('pokemon-gif');
const pokeTypes = require('poke-types');
const baseStats = require('./base_stats');
const config = require('config');
const monsterUtils = require("./monster_utils");

const typeConstants = {
    "Grass": {
        "emoji": "🌿",
        "color": 7915600
    },
    "Poison": {
        "emoji": "☠",
        "color": 10502304
    },
    "Fire": {
        "emoji": "🔥",
        "color": 15761456
    },
    "Flying": {
        "emoji": "🐦",
        "color": 11047152
    },
    "Water": {
        "emoji": "💧",
        "color": 6852848
    },
    "Bug": {
        "emoji": "🐛",
        "color": 11057184
    },
    "Normal": {
        "emoji": "⭕",
        "color": 9079385
    },
    "Dark": {
        "emoji": "🌑",
        "color": 7368816
    },
    "Electric": {
        "emoji": "⚡",
        "color": 16306224
    },
    "Ground": {
        "emoji": "🗿",
        "color": 14729320
    },
    "Fairy": {
        "emoji": "🦋",
        "color": 15243496
    },
    "Fighting": {
        "emoji": "👊",
        "color": 12595240
    },
    "Psychic": {
        "emoji": "🔮",
        "color": 16275592
    },
    "Steel": {
        "emoji": "🔩",
        "color": 12105936
    },
    "Ice": {
        "emoji": "❄",
        "color": 10016984
    },
    "Ghost": {
        "emoji": "👻",
        "color": 7362712
    },
    "Dragon": {
        "emoji": "🐲",
        "color": 7354616
    },
    "Rock": {
    	"emoji": "🗿",
    	"color": 12099640
  },
};

client.on('ready', () => {
    console.log(`Discord botto "${client.user.tag}" ready for action!`);
});

client.login(config.discord.token);

client.on('message', (msg) => {

    if(msg.content.startsWith(`${config.discord.prefix}cp `)) {
        const rawArgs = msg.content.slice(`${config.discord.prefix}cp`.length).split(' ');
        const args = rawArgs.join('|').toLowerCase().split('|');
    
        let monster = -1;
        let level = 40;
        let iv = [15, 15, 15];
        let minIv = [0, 0, 0];

        //Special handling of Alolan pokemen
        const isAlola = msg.content.toLowerCase().indexOf("alolan") !== -1;

        let setIv = false;

        args.forEach((element) => {
            if(element.toLowerCase().startsWith("lvl")) {
                if(!isNaN(element.substring(3).replace(",",".")) ) {
                    level = parseFloat(element.substring(3).replace(",",".") );

                    if(level > 40) level = 40;
                    if(level < 1) level = 1;
                    return;
                }
            }

            if(element.indexOf("/") !== -1 ) {
                //ivs 
                const ivSplit = element.split("/");
                if(ivSplit.length === 3 && !isNaN(ivSplit[0])
                    && !isNaN(ivSplit[1]) && !isNaN(ivSplit[2])) {

                    if(setIv) {
                        iv[0] = parseInt(ivSplit[0]);
                        iv[1] = parseInt(ivSplit[1]);
                        iv[2] = parseInt(ivSplit[2]); 
                    } else {
                        minIv[0] = parseInt(ivSplit[0]);
                        minIv[1] = parseInt(ivSplit[1]);
                        minIv[2] = parseInt(ivSplit[2]);
                        setIv = true;
                    }
                }
                return;
            }

            if(element === "alolan") {
                return;
            }

            const pid = isAlola ?
                _.findKey(monsterData, mon => mon.name.toLowerCase() === ("alolan " + element ) ) :
                _.findKey(monsterData, mon => mon.name.toLowerCase() === element);
            if (pid !== undefined) monster = pid;
        });


        if(monster === -1) {
            msg.reply(`Example usage: \`${config.discord.prefix}cp pokemon lvl10 [min attack/defense/stamina] [max attack/defense/stamina]\``);
            return;
        }

        let name = monsterData[monster].name;
        console.log(`${msg.author.username} requested info on ${name}`);

        min_cp = monsterUtils.calculateCp(monster, level, minIv[0], minIv[1], minIv[2]);
        max_cp = monsterUtils.calculateCp(monster, level, iv[0], iv[1], iv[2]);

        msg.reply(`CP range of a level ${level} **${name}** is **${min_cp}** (${minIv[0]}/${minIv[1]}/${minIv[2]}) - **${max_cp}** (${iv[0]}/${iv[1]}/${iv[2]})`);
    } else if (msg.content.startsWith(`${config.discord.prefix}pokedex `) || msg.content.startsWith(`${config.discord.prefix}dex `)) {

        const rawArgs = msg.content.startsWith(`${config.discord.prefix}pokedex `) ? 
			msg.content.slice(`${config.discord.prefix}pokedex`.length).split(' ') :
			msg.content.slice(`${config.discord.prefix}dex`.length).split(' ');
        const args = rawArgs.join('|').toLowerCase().split('|');
        let monsters = [];

        args.forEach((element) => {
            const pid = _.findKey(monsterData, mon => mon.name.toLowerCase() === element);
            if (pid !== undefined) monsters.push(pid);
        });

        monsters.forEach((monster) => {
            if (descriptions[monster - 1] === undefined) {
                msg.reply("I don't know anything about " + monsterData[monster].name);
                return;
            }

            let imageurl = `${config.discord.lowimageurl}${monster}.png`;

            if (monster > config.discord.maxlow) imageurl = descriptions[monster - 1].art_url;
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

            let min_cp_15 = monsterUtils.calculateCp(monster, 15, 10, 10, 10);
            let max_cp_15 = monsterUtils.calculateCp(monster, 15, 15, 15, 15);
            let min_cp_20 = monsterUtils.calculateCp(monster, 20, 10, 10, 10);
            let max_cp_20 = monsterUtils.calculateCp(monster, 20, 15, 15, 15);
            let min_cp_25 = monsterUtils.calculateCp(monster, 25, 10, 10, 10);
            let max_cp_25 = monsterUtils.calculateCp(monster, 25, 15, 15, 15);
            let min_cp_40 = monsterUtils.calculateCp(monster, 40, 10, 10, 10);
            let max_cp_40 = monsterUtils.calculateCp(monster, 40, 15, 15, 15);


            let view = {
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
                atk:baseStats[monster].attack,
                def:baseStats[monster].defense,
                sta:baseStats[monster].stamina
            };

            const e = [];
            monsterData[monster].types.forEach((type) => {
                e.push(typeConstants[type.type].emoji);
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


