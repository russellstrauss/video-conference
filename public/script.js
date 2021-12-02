const socket = io('/');
const videoGrid = document.getElementById('video-grid');
// const myPeer = new Peer(undefined, {
//   host: '/',
//   port: '443'
// });

// const myPeer = new Peer({host: 'peerjs-server.herokuapp.com', secure: false, port: 5000});
const myPeer = new Peer({host: 'peerjs-server.herokuapp.com', secure: true, port: 443});

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
navigator.mediaDevices.getUserMedia({
	video: true,
	audio: false // update me for sound
}).then(stream => {
	addVideoStream(myVideo, stream);

	myPeer.on('call', call => {
		console.log('call');
		call.answer(stream);
		const video = document.createElement('video');
		call.on('stream', userVideoStream => {
			console.log('stream');
			addVideoStream(video, userVideoStream);
		});
	});

	socket.on('user-connected', userId => {
		connectToNewUser(userId, stream);
		console.log('user-connected', userId);
	});
});

socket.on('user-disconnected', userId => {
	if (peers[userId]) peers[userId].close();
});

myPeer.on('open', id => {
	console.log('open', ROOM_ID, id);
	socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
	const call = myPeer.call(userId, stream);
	const video = document.createElement('video');
	call.on('stream', userVideoStream => {
		addVideoStream(video, userVideoStream);
	})
	call.on('close', () => {
		video.remove();
	})

	peers[userId] = call;
};

function addVideoStream(video, stream) {
	console.log('addVideoStream');
	video.srcObject = stream;
	video.addEventListener('loadedmetadata', () => {
		video.play();
	})
	videoGrid.append(video);
};