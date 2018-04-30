const express = require('express');
const app = express();
const http = require('http').Server(app);
const nunjucks = require('nunjucks');
const mongoose = require('mongoose');

var io = require('socket.io')(http);
const admin = io.of('/admin');
const client = io.of('/');

nunjucks.configure('views', {
	autoescape: true,
	express: app
});

app.set('view engine', 'njk');

app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.use('/p', express.static(__dirname + '/public'));


mongoose.connect('mongodb://localhost/replyBot');


const Log = mongoose.model('Log', {
	date: Date,
	user: String,
	agent: String,
	message: String
});

const Message = mongoose.model('Message', {
	date: Date,
	sessionId: String,
	agent: String,
	message: String
});


const User = mongoose.model('User', {
	date: Date,
	sessionId: String,
	userId: String,
	name: String,
	ip: String,
	disconnect: {
		type: Boolean,
		default: 0
	}
});

const Admin = mongoose.model('Admin', {
	username: String,
	password: String,
});



function randomId(length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
	var result = '';
	for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
	return result;
}

app.get('/', (req, res) => {

	res.render('index', {
		name: "Arthur"
	});
});


app.get('/admin', (req, res) => {

	res.render('adminIndex');
});



app.get('/getMessages', (req, res) => {

	Message.find({
			user: "Arthur"
		})
		.limit(10)
		.sort({
			date: -1
		})
		.exec(function(err, data) {
			console.log(data);
			res.write('done')
		});

	// res.render('adminIndex');
});

// app.get('/admin', (req, res) => res.render('adminIndex')  );
//
//
// app.get('/admin', function (req, res) {
//
//   res.render('adminIndex');
// });



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                             *
 *                               Client Socket                                 *
 *                                                                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

io.on('connection', function(socket) {
	console.log('a user connected');
	console.log(socket.handshake.query.name);
	console.log(socket.id);

	socket.on('identification', function(S_id, name) {
		if (S_id == "new") {
			var user = new User({
				date: Date.now(),
				sessionId: randomId(10),
				userId: socket.id,
				name: name,
				ip: socket.handshake.address
			});

			socket.name = user.name;
			socket.sessionId = user.sessionId;


			user.save(function(err) {
				console.log("insert");
				console.log('setr name : ' + socket.name);
				socket.emit('forceNameFromServer', name);
				admin.emit('newCustomer', socket.sessionId, socket.name);
				// socket.emit('getName');
			});
		} else {
			console.log("socket id or prev : " + S_id);

			User.findOne({
				'userId': S_id
			}, function(err, user) {
				if (err) return handleError(err);
				if (user) {
					var user = new User(user);

					user.userId = socket.id;
					user.disconnect = 0;

					socket.sessionId = user.sessionId;
					socket.name = user.name;

					user.save(function(err) {
						console.log("update");
						socket.emit('forceNameFromServer', user.name);
						admin.emit('newCustomer', socket.sessionId, socket.name);
						// admin.emit('updateCustomer', socket.sessionId , socket.name );
					});

				} else {
					var user = new User({
						date: Date.now(),
						sessionId: randomId(10),
						userId: socket.id,
						name: "---",
						ip: socket.handshake.address
					});

					socket.sessionId = user.sessionId;

					user.save(function(err) {
						console.log("insert");
						// socket.emit('forceNameFromServer', name);
						socket.emit('getName');
						// socket.emit('getName');
					});
				}

			});
		}
	})

	socket.on('setName', function(name) {
		User.findOne({
			'userId': socket.id
		}, function(err, user) {
			if (err) return handleError(err);
			if (user) {
				var user = new User(user);

				user.name = name;
				socket.name = name;

				user.save(function(err) {
					console.log("insert");
					socket.emit('forceNameFromServer', name);
				});

			}
			console.log('set name : ' + socket.name);
			admin.emit('newCustomer', socket.sessionId, socket.name);

		});
	})






	socket.on('message', function(me) {
		console.log(me);
		console.log(socket.sessionId);

		var message = new Message({
			date: Date.now(),
			sessionId: socket.sessionId,
			agent: 'Admin',
			message: me
		});

		message.save(function(err) {
			console.log("insert");
		});


		socket.emit('dispMessage', 1, me);
		// socket.broadcast.emit('dispMessage', 0, me);
		// admin.emit('dispMessage', 0, me);

		admin.emit('customerMessage', socket.sessionId, me);
		// admin.emit('test');

	})





	socket.on('disconnect', function() {
		console.log('Got disconnect!');
		console.log(socket.id);

		User.findOne({
			'userId': socket.id
		}, function(err, user) {
			if (err) return handleError(err);
			if (user) {
				var user = new User(user);

				user.disconnect = 1;

				user.save(function(err) {
					console.log("update");
					admin.emit('disconnectCustomer', user.sessionId)
					// admin.emit('updateCustomer', socket.sessionId , socket.name );
				});

			}

		});

	});
	socket.on('isTyping', function(state) {
		admin.emit('clientIsTyping', socket.sessionId, state)
		if (state) {
			console.log(socket.name + ' is typing');
		} else {
			console.log(socket.name + ' is leave typing');
		}
	});


});



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                             *
 *                                Admin Socket                                 *
 *                                                                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

io.of('/admin').on('connect', (socket) => {

	console.log(socket.handshake.query.username);
	console.log(socket.handshake.query.password);

	Admin.findOne({
		'username': socket.handshake.query.username,
		'password': socket.handshake.query.password
	}, function(err, admin) {
		if (err) return handleError(err);
		if (admin) {
			console.log("--- Admin Connected ---");
			socket.emit('adminAuth', 'sucess');
		} else {
			console.log('ban due to no auth');
			console.log("invalid account");
			socket.emit('adminAuth', 'error');
			socket.disconnect(true);
			console.log('sorry');
		}
	});

	User.find({
		disconnect: 0
	}, function(err, users) {
		if (err) return handleError(err);
		if (users) {
			console.log(users);
			admin.emit('connectedCustomer', users);
		}
	});



	socket.on('message', function(sessionId, me) {
		console.log(me);
		console.log(socket.id);
		console.log("sessionId " + sessionId);
		// console.log(getSocketIdBySessionId(sessionId));

		// admin.emit('message', o);
		socket.emit('dispMessage', sessionId, 1, me);
		socket.broadcast.emit('dispMessage', sessionId, 1, me);
		// client.emit('dispMessage', 0, me);
		// getSocketIdBySessionId(sessionId)
		emitBySessionId(sessionId, me);


	})

	socket.on('getPrevMessages', function() {
		console.log('get messages');
		Message.find({
				from: socket.handshake.query.name
			})
			.limit(10)
			.sort({
				date: -1
			})
			.exec(function(err, data) {
				socket.emit('loadPrevMessages', data)
			});
	})


});


http.listen(3000, function() {
	console.log('listening on *:3000');
});






function emitBySessionId(sessionId, me) {
	User.findOne({
		'sessionId': sessionId
	}, function(err, user) {
		if (err) return handleError(err);
		if (user) {
			console.log(user.userId);
			io.to(user.userId).emit('dispMessage', 0, me);
			return user.userId;
		} else {
			return null;
		}

	});
}









//