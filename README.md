# Professor-Poracle
Discord pokédex bot with target CP information for PokémonGo


#### Install

1) install requirements `npm install`  
2) copy and fill out config file `cp config/default.json.example config/default.json`
    * Discord bot token required  
    * Prefix is what your !commands start with
    * Fill "lowimageurl" if you would like to use your own source or images 
    * Fill maxlow for how many images your custom source has
3) Optional - copy types and configure colors (#hex) and custom emojis for reactions `cp config/types.json.example config/types.json`
	- If you want the defaults, it will copy for you, no action is required
4) Start the bot `npm start`
    
#### Usage

1) Invite bot to your discord server
2) ask it information about one or several pokémon `!pokedex dragonite pidgey`.
For every queried pokémon, bot will reply with their description, base stats, weaknesses, strengths, and CP ranges for lvl 15, 20 or 25 applicable in PokémonGo.
