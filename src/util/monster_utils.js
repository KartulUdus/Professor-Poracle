const baseStats = require('./base_stats')
const cp_multipliers = require('./cp-multipliers')

const calculateCp = function (monster, level, ivAttack, ivDefense, ivStamina) {
	cp_multi = cp_multipliers[level]
	atk = baseStats[monster].attack
	def = baseStats[monster].defense
	sta = baseStats[monster].stamina

	return Math.max(10, Math.floor(
		(atk + ivAttack)
          * Math.pow(def + ivDefense, 0.5)
          * Math.pow(sta + ivStamina, 0.5)
          * Math.pow(cp_multi, 2)
          / 10
	))
}

module.exports = {
	calculateCp: calculateCp
}
