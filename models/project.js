var neo4j = require("neo4j");
//var db = new neo4j.GraphDatabase("http://codemap:kOITyJ5vrvCQDF9N8ybB@codemap.sb01.stations.graphenedb.com:24789");
var db = new neo4j.GraphDatabase("http://localhost:7447");

//var Skill = require('./skill');

/*
var node = db.createNode({hello: 'world'});     // instantaneous, but...

node.save(function (err, node) {    // ...this is what actually persists.
     if (err) {
         console.error('Error saving new node to database:', err);
     } else {
         console.log('Node saved to database with id:', node.id);
     }
});
*/
var INDEX_NAME = 'nodes';
var INDEX_KEY = 'type'; 
var INDEX_VAL = 'projects';
var OTHER_INDEX_VAL = 'company';
//var relationType = 'none';
var otherTypeRelation = 'employee';
//var interestRelation = 'has interest in'; //Future

var Project = module.exports = function Project(_node) {
    this._node = _node;
}

Object.defineProperty(Project.prototype, 'id', {
    get: function() { return this._node.id; }
});

Object.defineProperty(Project.prototype, 'exists', {
    get: function() { return this._node.exists; }
});

Object.defineProperty(Project.prototype, 'title', {
    get: function() { return this._node.data['title']; },
    set: function(title) { this._node.data['title'] = title; }
});

Object.defineProperty(Project.prototype, 'type', {
    get: function() { return this._node.projectsType; },
    set: function(type) { this._node.projectsType = type; }
});

//Project/Owner/Project, etc. Not something that should live elsewhere?
/*
Object.defineProperty(Project.prototype, 'url', {
    get: function() { return this._node.data['url']; },
    set: function(url) { this._node.data['url'] = url; }
});
*/
//Type will be inferred based on relationships

/*
Project.prototype._getSkills = function(other, callback) {
    var query = [
        'START projects=node({projectsId}), other=node({otherId})',
        'OPTIONAL MATCH (projects) -[rel:GENERIC_REL]-> (other)',
        'RETURN rel'
    ].join('\n')
        .replace('GENERIC_REL', skillRelation);

    var params = {
        projectsId: this.id,
        otherId: other.id
    }

    db.query(query, params, function(err, res) {
        if(err) return callback(err);
        var rel = res[0] && res[0]['rel'];
        callback(null, rel);
    });
};
*/

Project.prototype.save = function(callback) {
    this._node.save(function(err) {
        callback(err);
    });
};

Project.prototype.relate = function(other, typeRelation, callback) {
    //Where should this logic live?
    //Relationship hash => this type + that type -> rel_type
    //if node.type && other.type == "projects"  => friends
    //if node.type && other.type => friends
    this._node.createRelationshipTo(other._node, typeRelation, {}, function(err, rel) {
        callback(err);
    });
};

Project.prototype.getSkills = function(callback) {
    var query = [
        'START projects=node({projectsId}), other=node:INDEX_NAME(INDEX_KEY="INDEX_VAL")',
        'OPTIONAL MATCH (projects) -[rel:GENERIC_REL]-> (other)',
        'RETURN other, COUNT(rel)'
    ].join('\n')
        .replace('INDEX_NAME', INDEX_NAME)
        .replace('INDEX_KEY', INDEX_KEY)
        .replace('INDEX_VAL', OTHER_INDEX_VAL)
        .replace('GENERIC_REL', otherTypeRelation);

    var params = {
        projectsId: this.id,
    };

    var projects = this;
    db.query(query, params, function(err, res) {
        if(err) return callback(err);

        var relatives = [];
        var others = [];

        for(var i=0; i < res.length; i++) {
            var other = new Skill(res[i]['other']); 
            var relates = res[i]['COUNT(rel)'];
            if(projects.id === other.id) {
                continue;
            } else if (relates){
                relatives.push(other);
            } else {
                others.push(other);
            }
        }

        callback(null, relatives, others);
    });
};

Project.get = function(id, callback) {
    console.log("projects.get");
    db.getNodeById(id, function(err, node) {
        if(err) return callback(err);
        callback(null, new Project(node));
    });
};

Project.getAll = function(callback) {
    db.getIndexedNodes(INDEX_NAME, INDEX_KEY, INDEX_VAL, function(err, nodes) {
        if(err) {
            if(err.message.match(/Neo4j NotFoundException/i)) {
                return callback(null, []);
            } else {
                return callback(err);
            }
        }
        var projectss = nodes.map(function(node) {
            return new Project(node);
        });
        callback(null, projectss);
    });
}

Project.create = function(data, arg, callback) {
    console.log("Project creation data:");
    console.log(data);
    var node = db.createNode(data);
    var projects = new Project(node);
    console.log("Project creation data1:");
    node.save(function(err) {
        if(err) return callback(err);
    console.log("Project creation data2:");
        node.index(INDEX_NAME, INDEX_KEY, INDEX_VAL, function(err) {
    console.log("Project creation data3:");
            if(err) console.log("error!");
            if(err) console.log(err);
            if(err) return callback(err);
            callback(null, projects, arg);
        });
    });
};





