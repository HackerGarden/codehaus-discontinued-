// project routes
//



var Project = require('../models/project');
var User = require('../models/user');

var userRelation = 'created';

// Project.getAll not implemented yet
exports.list = function(req, res, next) {
    Project.getAll(function(err, projects) {
        if(err) return next(err);
        User.getAll(function(err, users) {
            if(err) return next(err);
            res.render('projects', {
                projects: projects,
                users: users
            });
        });
    });
};

exports.create = function(req, res, next) {
    console.log("create req: %s \n res: %s \n", req, res);
    console.log("next" );
    console.log(next);
    console.log(req.body);
    Project.create({
        title: req.body['title']
    }, null, function(err, project) {
        User.get(req.body.user.id, function(err, user) {
            if(err) return next(err);
            project.relate(user, userRelation, function(err) {
                if(err) return next(err);
                res.redirect('/projects/' + project.id);
            });
        });
    });
};

exports.show = function(req, res, next) {
    console.log("project exports.show");
    Project.get(req.params.id, function(err, project) {
        if(err) return next(err);
        res.render('project', {
            project: project
        });
        /*
        project.getSkills(function(err, relatives, others) {
            if(err) return next(err);
            res.render('project', {
                project: project,
                relations: relatives,
                others: others 
            });
        });
        */
    });
};

exports.relate = function(req, res, next) {
    Project.get(req.params.id, function(err, project) {
        if(err) return next(err);
        Project.get(req.body.project.id, function(err, other) {
            if(err) return next(err);
            project.relate(other, function(err) {
                if(err) return next(err);
                res.redirect('/projects/' + project.id);
            });
        });
    });
};

