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
var INDEX_VAL = 'user';
var OTHER_INDEX_VAL = 'company';
//var relationType = 'none';
var otherTypeRelation = 'employee';
//var interestRelation = 'has interest in'; //Future

var User = module.exports = function User(_node) {
    this._node = _node;
}

Object.defineProperty(User.prototype, 'id', {
    get: function() { return this._node.id; }
});

Object.defineProperty(User.prototype, 'exists', {
    get: function() { return this._node.exists; }
});

Object.defineProperty(User.prototype, 'title', {
    get: function() { return this._node.data['title']; },
    set: function(title) { this._node.data['title'] = title; }
});

Object.defineProperty(User.prototype, 'type', {
    get: function() { return this._node.userType; },
    set: function(type) { this._node.userType = type; }
});

//Project/Owner/User, etc. Not something that should live elsewhere?
/*
Object.defineProperty(User.prototype, 'url', {
    get: function() { return this._node.data['url']; },
    set: function(url) { this._node.data['url'] = url; }
});
*/
//Type will be inferred based on relationships

/*
User.prototype._getSkills = function(other, callback) {
    var query = [
        'START user=node({userId}), other=node({otherId})',
        'OPTIONAL MATCH (user) -[rel:GENERIC_REL]-> (other)',
        'RETURN rel'
    ].join('\n')
        .replace('GENERIC_REL', skillRelation);

    var params = {
        userId: this.id,
        otherId: other.id
    }

    db.query(query, params, function(err, res) {
        if(err) return callback(err);
        var rel = res[0] && res[0]['rel'];
        callback(null, rel);
    });
};
*/

User.prototype.save = function(callback) {
    this._node.save(function(err) {
        callback(err);
    });
};

User.prototype.relate = function(other, typeRelation, callback) {
    //Where should this logic live?
    //Relationship hash => this type + that type -> rel_type
    //if node.type && other.type == "user"  => friends
    //if node.type && other.type => friends
    this._node.createRelationshipTo(other._node, typeRelation, {}, function(err, rel) {
        callback(err);
    });
};


User.prototype.getSkills = function(callback) {
    var query = [
        'START user=node({userId}), other=node:INDEX_NAME(INDEX_KEY="INDEX_VAL")',
        'OPTIONAL MATCH (user) -[rel:GENERIC_REL]-> (other)',
        'RETURN other, COUNT(rel)'
    ].join('\n')
        .replace('INDEX_NAME', INDEX_NAME)
        .replace('INDEX_KEY', INDEX_KEY)
        .replace('INDEX_VAL', OTHER_INDEX_VAL)
        .replace('GENERIC_REL', otherTypeRelation);

    var params = {
        userId: this.id,
    };

    var user = this;
    db.query(query, params, function(err, res) {
        if(err) return callback(err);

        var relatives = [];
        var others = [];

        for(var i=0; i < res.length; i++) {
            var other = new Skill(res[i]['other']); 
            var relates = res[i]['COUNT(rel)'];
            if(user.id === other.id) {
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

User.get = function(id, callback) {
    console.log("user.get");
    db.getNodeById(id, function(err, node) {
        if(err) return callback(err);
        callback(null, new User(node));
    });
};

User.getAll = function(callback) {
    db.getIndexedNodes(INDEX_NAME, INDEX_KEY, INDEX_VAL, function(err, nodes) {
        if(err) {
            if(err.message.match(/Neo4j NotFoundException/i)) {
                return callback(null, []);
            } else {
                return callback(err);
            }
        }
        var users = nodes.map(function(node) {
            return new User(node);
        });
        callback(null, users);
    });
}

User.create = function(data, arg, callback) {
    console.log("User creation data:");
    console.log(data);
    var node = db.createNode(data);
    var user = new User(node);
    console.log("User creation data1:");
    node.save(function(err) {
        if(err) return callback(err);
    console.log("User creation data2:");
        node.index(INDEX_NAME, INDEX_KEY, INDEX_VAL, function(err) {
    console.log("User creation data3:");
            if(err) console.log("error!");
            if(err) console.log(err);
            if(err) return callback(err);
            callback(null, user, arg);
        });
    });
};





