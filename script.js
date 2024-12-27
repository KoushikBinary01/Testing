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

function showJoinInput() {
    document.getElementById('callInfo').style.display = 'block';
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('joinButton').textContent = 'Connect';
    document.getElementById('joinButton').removeEventListener('click', showJoinInput);
    document.getElementById('joinButton').addEventListener('click', joinCall);
}

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
    } catch (err) {
        console.error('Error starting call:', err);
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
        console.log('Joining call with code:', codeToJoin);
        
        // Visual feedback that join was successful
        document.getElementById('joinCode').style.borderColor = 'green';
        document.getElementById('joinButton').textContent = 'Connected';
        document.getElementById('joinButton').disabled = true;
        
    } catch (err) {
        console.error('Error joining call:', err);
    }
}

function setupPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);
    
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });
    
    peerConnection.ontrack = event => {
        document.getElementById('remoteVideo').srcObject = event.streams[0];
    };
    
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            // Send candidate to remote peer
            console.log('New ICE candidate:', event.candidate);
        }
    };
}
