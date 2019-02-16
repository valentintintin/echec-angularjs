var server = require('http').createServer();
var io = require('socket.io')(server);

var plateau = [];
var users = [];

var lastUserMoved = null;

io.on('connection', function (client) {

    client.on('user', function (data) {
        if (data && data.name) {
            var userI = users.findIndex(u => u.name === data.name);
            if (userI !== -1) {
                users[userI] = data;
            } else {
                users.push(data);
            }
            console.log('user', data);
            io.emit('list_users', users);
        }
    });

    client.on('get_users', function () {
        io.emit('list_users', users);
    });

    client.on('disconnect', function () {
        console.log('disconnect');
    });

    client.on('start', function () {
        for (var y = 0; y < 8; y++) {
            plateau[y] = [];
            for (var x = 0; x < 8; x++) {
                var caseInside = {
                    color: null,
                    type: null,
                    x: x,
                    y: y
                };

                if (y >= 6) {
                    caseInside.color = 'noir';
                } else if (y < 2) {
                    caseInside.color = 'gris';
                }

                if (y === 7 || y === 0) {
                    if (x === 0 || x === 7) {
                        caseInside.type = 'tour';
                    } else if (x === 1 || x === 6) {
                        caseInside.type = 'cheval';
                    } else if (x === 2 || x === 5) {
                        caseInside.type = 'fou';
                    } else if (x === 3 && y === 7 || x === 4 && y === 0) {
                        caseInside.type = 'reine';
                    } else if (x === 4 && y === 7 || x === 3 && y === 0) {
                        caseInside.type = 'roi';
                    }
                } else if (y === 6 || y === 1) {
                    caseInside.type = 'pion';
                }

                plateau[y].push(caseInside);
            }
        }

        io.emit('plateau', plateau);
        console.log('start new game');
    });

    client.on('move', function (data) {
        if (data && data.oldCase && data.newCase && plateau.length && data.oldCase.type) {
            console.log('move', data.newCase, data.oldCase);
            plateau[data.oldCase.y][data.oldCase.x] = {
                type: null,
                color: null,
                x: data.oldCase.x,
                y: data.oldCase.y
            };
            plateau[data.newCase.y][data.newCase.x] = data.oldCase;
            plateau[data.newCase.y][data.newCase.x].x = data.newCase.x;
            plateau[data.newCase.y][data.newCase.x].y = data.newCase.y;
            io.emit('plateau', plateau);
	    lastUserMoved = data.user;
        }
    });

    client.on('get_plateau', function () {
        io.emit('plateau', plateau);
    });

    client.on('reset', function () {
        plateau.length = 0;
        users.length = 0;
        io.emit('list_users', users);
    });

});

server.listen(2609);
