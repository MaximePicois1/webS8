const freelancesData = require('../models/freelances')

function getFreelances() {
	//return freelancesData.map(({ id, name, job, picture }) => ({
	//	id,
	//	name, 
	//	job, 
	//	picture
	//}))
	return freelancesData
}

module.exports = getFreelances