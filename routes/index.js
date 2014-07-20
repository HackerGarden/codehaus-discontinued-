
exports.index = function(req, res){
    res.render('index');
};

//exports.items = require('./items');
//exports.skills = require('./skills');
exports.users = require('./users');
exports.companies = require('./companies');
exports.industry = require('./industry');
exports.schools = require('./schools');
exports.projects = require('./projects');
