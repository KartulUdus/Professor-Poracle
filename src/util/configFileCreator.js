const fs = require('fs')
const { promisify } = require('util')

const readFileAsync = promisify(fs.readFile)
const path = require('path')

module.exports = () => {
	if (!fs.existsSync(path.join(__dirname, '../../config/local.json'))) {
		const defaultConfig = readFileSync(path.join(__dirname, '../../config/default.json'), 'utf8')
		fs.writeFileSync(path.join(__dirname, '../../config/local.json'), defaultConfig)
	}

	if (!fs.existsSync(path.join(__dirname, '../../config/types.json'))) {
		const emergTypesConf = fs.readFileSync(path.join(__dirname, '../../config/types.json.example'), 'utf8')
		fs.writeFileSync(path.join(__dirname, '../../config/types.json'), emergTypesConf)
	}
}