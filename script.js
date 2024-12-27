let localStream;
let peerConnection;
let roomId;

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

document.getElementById('startButton').addEventListener('click', startCall);
document.getElementById('joinButton').addEventListener('click', joinCall);

async function startCall() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('localVideo').srcObject = localStream;
        
        // Generate a random room ID
        roomId = Math.random().toString(36).substring(7);
        document.getElementById('callCode').textContent = roomId;
        document.getElementById('callInfo').style.display = 'block';
        
        setupPeerConnection();
        
        // Here you would typically set up your signaling server connection
        // and handle the offer/answer process
    } catch (err) {
        console.error('Error starting call:', err);
    }
}

async function joinCall() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('localVideo').srcObject = localStream;
        
        const codeToJoin = document.getElementById('joinCode').value;
        if (!codeToJoin) {
            alert('Please enter a call code');
            return;
        }
        
        setupPeerConnection();
        
        // Here you would typically connect to the signaling server
        // and handle the offer/answer process using the codeToJoin
    } catch (err) {
        console.error('Error joining call:', err);
    }
}

function setupPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);
    
    // Add local stream to peer connection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });
    
    // Handle incoming remote stream
    peerConnection.ontrack = event => {
        document.getElementById('remoteVideo').srcObject = event.streams[0];
    };
    
    // Handle ICE candidates
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            // Send the candidate to the remote peer via signaling server
        }
    };
}
