// user routes
//



var User = require('../models/user');


var studentRelation = 'student';


// User.getAll not implemented yet
exports.list = function(req, res, next) {
    User.getAll(function(err, users) {
        if(err) return next(err);
        res.render('users', {
            users: users
        });
    });
};

exports.create = function(req, res, next) {
    User.create({
        title: req.body['title']
    }, null, function(err, user) {
        if(err) return next(err);
        res.redirect('/users/' + user.id);
    });
};

exports.show = function(req, res, next) {
    User.get(req.params.id, function(err, user) {
        if(err) return next(err);
        res.render('user', {
            user: user
        });
        /*
        user.getSkills(function(err, relatives, others) {
            if(err) return next(err);
            res.render('user', {
                user: user,
                relations: relatives,
                others: others 
            });
        });
        */
    });
};

exports.relate = function(req, res, next) {
    User.get(req.params.id, function(err, user) {
        if(err) return next(err);
        User.get(req.body.user.id, function(err, other) {
            if(err) return next(err);
            user.relate(other, function(err) {
                if(err) return next(err);
                res.redirect('/users/' + user.id);
            });
        });
    });
};

//Introduce the concept of students as an api call,
//also everything in this file should be genericized


/* allows you to specify the proposing node and the acceptring node 
 *  of any 2 relationship holding nodes in the request body
 *  FEARS: models['key'] style gets too large to handle
 *  IDEAS: well, each of these is an http request already...
 *          Why don't the requests just filter through a network
 *          while carrying their callbacks as they see fit, chaining
 *          between machines in an automagical distributed hash/key
 *          fashion. The result must be replicated on more than N 
 *          machines to be considered "fault tolerant" per the number
 *          of machines in the group, etc. but that's a distributed 
 *          system problem that can be tunded. Also, what aboue evolving
 *          hashes? just because the data is in one spot, and then the 
 *          membership changes, why does the data now have to resolve to
 *          a new place? can't the system keep a change log of the hashes
 *          such that it can look in the proper places? Also, 2/3 messengers
 *          traversing the compute graph will be much more fault tolerant
 *          and efficient than a single leader requiring everyone come to 
 *          the same conclusion. this situation requires that a single
 *          machine do all of the work, rather than let many machines
 *          carry the task of arriving at a safe answer without having to
 *          copy data into the place of one mind
exports.create_generic = function(req, res, next) {
    var Proposer = req.body['proposer'];
    var Acceptor = req.body['acceptor'];
    if(!Proposer.type || !Acceptor.type) return next("No type");
    var Relation = req.body['relation'];
    models[Proposer.type].get(Proposer.id, function(err, proposer) {
        if(err) return next(err);
        models[Acceptor.type].get(Acceptor.id, function(err, acceptor) {
            if(err) return next(err);
            proposer.relate(acceptor, Relation, function(err) {
                if(err) return next(err);
                res.redirect('/'+Proposer.type+'/' + Proposer.id);
            });
        });
    });
};

            
    User.get(req.params.id, function(err, user) {
        if(err) return next(err);
        School.get(req.body['school'].id, function(err, school) {
            if(err) return next(err);
            user.relate(school, schoolRelation function(err) {
                if(err) return next(err);
                res.redirect('/'+school.name+'/faculty/' + user.id);
            });
        });
    });
};
*/

