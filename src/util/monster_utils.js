const cp_multipliers = require('./cp-multipliers')

const calculateCp = function (monster, level, ivAttack, ivDefense, ivStamina) {
	const cp_multi = cp_multipliers[level]
	const atk = monster.stats.baseAttack
	const def = monster.stats.baseDefense
	const sta = monster.stats.baseStamina

	return Math.max(10, Math.floor(
			(atk + ivAttack)
          * (def + ivDefense) ** 0.5
          * (sta + ivStamina) ** 0.5
          * cp_multi **  2
          / 10
	))
}

module.exports = {
	calculateCp
}
