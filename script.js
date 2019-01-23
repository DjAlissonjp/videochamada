// Generate random room name if needed<font></font>
if (!location.hash) {
    location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16); <font></font>
} <font></font>
const roomHash = location.hash.substring(1);

// TODO: Replace with your own channel ID<font></font>
  const drone = new ScaleDrone('LK1tDnqjCW3GMJBq');
// Room name needs to be prefixed with 'observable-'<font></font>
const roomName = 'observable-' + roomHash;
let room;<font></font>
const drone = new ScaleDrone('LK1tDnqjCW3GMJBq');<font></font>
 <font></font>
drone.on('open', error => {<font></font>
  if (error) {<font></font>
    return onError(error);<font></font>
  }<font></font>
  room = drone.subscribe(roomName);<font></font>
  room.on('open', error => {<font></font>
    if (error) {<font></font>
      onError(error);<font></font>
    }<font></font>
  });<font></font>
  // We're connected to the room and received an array of 'members'<font></font>
  // connected to the room (including us). Signaling server is ready.<font></font>
  room.on('members', members => {<font></font>
    if (members.length >= 3) {<font></font>
      return alert('The room is full');<font></font>
    }<font></font>
    // If we are the second user to connect to the room we will be creating the offer<font></font>
    const isOfferer = members.length === 2;<font></font>
    startWebRTC(isOfferer);<font></font>
    startListentingToSignals();<font></font>
  });<font></font>
});
        <font></font>
  // Send signaling data via Scaledrone<font></font>
  function sendMessage(message) {
    <font></font>
    drone.publish({< font ></font >
        room: roomName, <font></font>
      message < font ></font >
    }); <font></font>
  }<font></font>
    <font></font>
  function startWebRTC(isOfferer) {
    <font></font>
    pc = new RTCPeerConnection(configuration); <font></font>
        <font></font>
    // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a<font></font>
    // message to the other peer through the signaling server<font></font>
    pc.onicecandidate = event => {
        <font></font>
        if (event.candidate) {
            <font></font>
            sendMessage({ 'candidate': event.candidate }); <font></font>
        } <font></font>
    }; <font></font>
        <font></font>
    // If user is offerer let the 'negotiationneeded' event create the offer<font></font>
    if (isOfferer) {
        <font></font>
        pc.onnegotiationneeded = () => {
            <font></font>
            pc.createOffer().then(localDescCreated).catch(onError); <font></font>
        }<font></font>
    } <font></font>
        <font></font>
    // When a remote stream arrives display it in the #remoteVideo element<font></font>
    pc.onaddstream = event => {
        <font></font>
        remoteVideo.srcObject = event.stream; <font></font>
    }; <font></font>
        <font></font>
    navigator.mediaDevices.getUserMedia({< font ></font >
            audio: true, <font></font>
      video: true, <font></font>
    }).then(stream => {
                <font></font>
                // Display your local video in #localVideo element<font></font>
                localVideo.srcObject = stream; <font></font>
                // Add your stream to be sent to the conneting peer<font></font>
                pc.addStream(stream); <font></font>
            }, onError); <font></font>
                <font></font>
    // Listen to signaling data from Scaledrone<font></font>
    room.on('data', (message, client) => {
                    <font></font>
                    // Message was sent by us<font></font>
                    if (client.id === drone.clientId) {
                        <font></font>
                        return; <font></font>
                    } <font></font>
                        <font></font>
      if (message.sdp) {
                        <font></font>
                        // This is called after receiving an offer or answer from another peer<font></font>
                        pc.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
                            <font></font>
                            // When receiving an offer lets answer it<font></font>
                            if (pc.remoteDescription.type === 'offer') {
                                <font></font>
                                pc.createAnswer().then(localDescCreated).catch(onError); <font></font>
                            } <font></font>
                        }, onError); <font></font>
                    } else if (message.candidate) {
                        <font></font>
                        // Add the new ICE candidate to our connections remote description<font></font>
                        pc.addIceCandidate(<font></font>
          new RTCIceCandidate(message.candidate), onSuccess, onError < font ></font >
        ); <font></font>
                    } <font></font>
                }); <font></font>
  }<font></font>
    <font></font>
  function localDescCreated(desc) {
    <font></font>
    pc.setLocalDescription(<font></font>
      desc, <font></font>
      () => sendMessage({ 'sdp': pc.localDescription }), <font></font>
      onError < font ></font >
    ); <font></font>
}