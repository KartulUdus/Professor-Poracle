const readline = require('readline');
const fs = require('fs');
const tokenPattern = /[ODMN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}/g
const readlineSync = require('readline-sync')

module.exports = async (config) => {
    console.log('Please enter a discord token to use:')

    readlineSync.promptLoop(function(input) {
        if (!input.match(tokenPattern)) {
            console.log('That does\'t look like a discord token, try again:')
        }
        else {
            config.discord.token = input.match(tokenPattern)[0]
            fs.writeFileSync(`${__dirname}/../../config/local.json`, JSON.stringify(config, null, 2) , 'utf-8')            
        }
        return input.match(tokenPattern)
      });
}
