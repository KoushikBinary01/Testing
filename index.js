const startButton = document.getElementById('startButton');
const hangupButton = document.getElementById('hangupButton');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let remoteStream;
let peerConnection;

// STUN server for NAT traversal
const config = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

// Start the video call
startButton.onclick = async () => {
  startButton.disabled = true;
  hangupButton.disabled = false;

  // Get user media (local camera stream)
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;

  // Create peer connection
  peerConnection = new RTCPeerConnection(config);

  // Add local stream to peer connection
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  // Remote stream handler
  peerConnection.ontrack = event => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
      remoteVideo.srcObject = remoteStream;
    }
    remoteStream.addTrack(event.track);
  };

  // ICE candidate handling
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      console.log('New ICE candidate:', event.candidate);
      // Send the candidate to the remote peer (e.g., via WebSocket or signaling server)
    }
  };

  // Create and set an offer
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  console.log('Offer created:', offer);

  // Simulate sending and receiving the offer for the same peer in this example
  simulateRemotePeer(offer);
};

// Simulate receiving the offer from a remote peer
async function simulateRemotePeer(offer) {
  const remotePeerConnection = new RTCPeerConnection(config);

  remotePeerConnection.onicecandidate = event => {
    if (event.candidate) {
      console.log('Remote ICE candidate:', event.candidate);
    }
  };

  remotePeerConnection.ontrack = event => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
      remoteVideo.srcObject = remoteStream;
    }
    remoteStream.addTrack(event.track);
  };

  remotePeerConnection.addEventListener('icecandidate', event => {
    if (event.candidate) {
      peerConnection.addIceCandidate(event.candidate);
    }
  });

  remotePeerConnection.setRemoteDescription(offer);
  localStream.getTracks().forEach(track => remotePeerConnection.addTrack(track, localStream));

  const answer = await remotePeerConnection.createAnswer();
  await remotePeerConnection.setLocalDescription(answer);
  await peerConnection.setRemoteDescription(answer);

  console.log('Answer created and exchanged:', answer);
}

// Hang up the call
hangupButton.onclick = () => {
  localStream.getTracks().forEach(track => track.stop());
  if (peerConnection) {
    peerConnection.close();
  }
  hangupButton.disabled = true;
  startButton.disabled = false;
};
