const importFresh = require('import-fresh')

let config

module.exports = () => {
	config = importFresh('config')
	return { config }
}