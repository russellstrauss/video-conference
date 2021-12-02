const express = require('express');
const https = require('https');
const app = express();
// const server = require('http').createServer(app);

const fs = require('fs')


var privateKey = fs.readFileSync('localhost+2-key.pem');
var certificate = fs.readFileSync('localhost+2.pem');
const options = {
	key: privateKey,
	cert: certificate
};
const server = https.createServer(options, app).listen(443);






const io = require('socket.io').listen(server);
const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', (req, res) => {
	console.log('redirect');
	res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
	console.log('get room');
	res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {
	
	console.log('connection');
	
	socket.on('join-room', (roomId, userId) => {
		
		console.log('backend join userID: ', userId);
		
		socket.join(roomId);
		socket.to(roomId).broadcast.emit('user-connected', userId);
		
		socket.on('disconnect', () => {
			socket.to(roomId).broadcast.emit('user-disconnected', userId);
		});
	});
});

// https.createServer(options, app).listen(443);
// server.listen(443);