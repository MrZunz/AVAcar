exports.index = function(req, res){
	res.render('layout');
};

exports.pages = function (req, res) {
	var page = req.params.page;

	res.render('pages/' + page);
};

exports.subpages = function (req, res) {
	var page = req.params.page;
	var subpage = req.params.subpage;
	res.render('pages/' + page + "/" + subpage);
};

exports.menus = function (req, res) {
	var menu = req.params.menu;
	res.render('partials/menus/' + menu);
};

exports.partials = function (req, res) {
	var name = req.params.name;
	res.render('partials/' + name);
};

exports.actions = function (req, res) {
	var action = req.params.action;
	res.render('partials/actions/' + action);
};