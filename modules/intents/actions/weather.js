function Weather() {

}

Weather.prototype.search = function(parameters) {
	console.log("Weather's search method got called and the parameters are", parameters);
};

module.exports = exports = new Weather();