let peerConnection;
let localStream;
const configuration = { 
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] 
};

async function startCall() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('localVideo').srcObject = localStream;
        
        peerConnection = new RTCPeerConnection(configuration);
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
        
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                document.getElementById('status').textContent = 
                    `Your join code: ${btoa(JSON.stringify(event.candidate))}`;
            }
        };

        peerConnection.ontrack = event => {
            document.getElementById('remoteVideo').srcObject = event.streams[0];
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
    } catch (err) {
        console.error(err);
        document.getElementById('status').textContent = 'Error: ' + err.message;
    }
}

async function joinCall() {
    try {
        const joinCode = document.getElementById('joinCode').value;
        const candidate = JSON.parse(atob(joinCode));
        
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('localVideo').srcObject = localStream;
        
        peerConnection = new RTCPeerConnection(configuration);
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
        
        peerConnection.ontrack = event => {
            document.getElementById('remoteVideo').srcObject = event.streams[0];
        };

        await peerConnection.addIceCandidate(candidate);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
    } catch (err) {
        console.error(err);
        document.getElementById('status').textContent = 'Error: ' + err.message;
    }
}

document.getElementById('startCall').onclick = startCall;
document.getElementById('joinCall').onclick = joinCall;