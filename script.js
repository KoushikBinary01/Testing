let localStream;
let peerConnection;
let roomId;

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

document.getElementById('startButton').addEventListener('click', startCall);
document.getElementById('joinButton').addEventListener('click', showJoinInput);

async function startCall() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('localVideo').srcObject = localStream;
        
        roomId = Math.random().toString(36).substring(7);
        document.getElementById('callCode').textContent = roomId;
        document.getElementById('callInfo').style.display = 'block';
        document.getElementById('joinCode').style.display = 'none';
        document.getElementById('joinButton').style.display = 'none';
        
        setupPeerConnection();
        createOffer();
    } catch (err) {
        console.error('Error starting call:', err);
    }
}

async function createOffer() {
    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        // Here you would send this offer to the other peer via your signaling server
        console.log('Offer created:', offer);
    } catch (err) {
        console.error('Error creating offer:', err);
    }
}

async function joinCall() {
    const codeToJoin = document.getElementById('joinCode').value.trim();
    
    if (!codeToJoin) {
        document.getElementById('joinCode').style.borderColor = 'red';
        return;
    }

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('localVideo').srcObject = localStream;
        
        setupPeerConnection();
        createAnswer();
        
        document.getElementById('joinCode').style.borderColor = 'green';
        document.getElementById('joinButton').textContent = 'Connected';
        document.getElementById('joinButton').disabled = true;
    } catch (err) {
        console.error('Error joining call:', err);
    }
}

async function createAnswer() {
    try {
        // Here you would receive the offer from the other peer via your signaling server
        // const offer = // received offer
        // await peerConnection.setRemoteDescription(offer);
        
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        // Here you would send this answer back to the other peer via your signaling server
        console.log('Answer created:', answer);
    } catch (err) {
        console.error('Error creating answer:', err);
    }
}

function setupPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);
    
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });
    
    peerConnection.ontrack = event => {
        if (event.streams && event.streams[0]) {
            document.getElementById('remoteVideo').srcObject = event.streams[0];
        }
    };
    
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            // Send this candidate to the remote peer via signaling server
            console.log('New ICE candidate:', event.candidate);
        }
    };

    peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE Connection State:', peerConnection.iceConnectionState);
    };

    peerConnection.onconnectionstatechange = () => {
        console.log('Connection State:', peerConnection.connectionState);
    };
}

function showJoinInput() {
    document.getElementById('callInfo').style.display = 'block';
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('joinButton').textContent = 'Connect';
    document.getElementById('joinButton').removeEventListener('click', showJoinInput);
    document.getElementById('joinButton').addEventListener('click', joinCall);
}
