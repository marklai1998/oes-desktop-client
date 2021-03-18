import { socketEvent } from './../../constants/socketEvent';
import { useCallback, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { PureUser } from '../../types/user';
import { userTierType } from '../../constants/userTierType';
import { message } from 'antd';
import { useMap } from 'react-use';
import * as R from 'ramda';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

export const useExamRTC = ({
  examId,
  mediaStreams = [],
}: {
  examId: string;
  mediaStreams?: MediaStream[];
}) => {
  const { socket } = useSocket();
  const [peers, { set: setPeer, remove: removePeer }] = useMap<{
    [peerId: string]: {
      connection: RTCPeerConnection;
      user: PureUser;
    };
  }>({});

  const handleAddPeer = useCallback(
    async ({
      peerId,
      user,
      shouldCreateOffer,
    }: {
      peerId: string;
      user: PureUser;
      shouldCreateOffer: boolean;
    }) => {
      if (!socket) return;

      console.log('Add peer', peerId, user);
      if (
        user.tier === userTierType.ADMIN ||
        user.tier === userTierType.TEACHER
      ) {
        message.info(`Invigilator ${user.username} has joined the exam`);
      }

      // peer already exist
      if (peers[peerId]) return;

      const peerConnection = new RTCPeerConnection({
        iceServers: ICE_SERVERS,
      });

      setPeer(peerId, { connection: peerConnection, user });

      peerConnection.onicecandidate = (event) => {
        if (!event.candidate) return;
        console.log('Create ICE candidate');
        socket.emit(socketEvent.RELAY_ICE_CANDIDATE, {
          peerId,
          iceCandidate: event.candidate,
        });
      };

      peerConnection.ontrack = (event) => {
        console.log('onAddStream', event);
      };

      if (shouldCreateOffer) {
        console.log('Creating RTC offer to ', peerId);
        const localDescription = await peerConnection.createOffer();

        peerConnection.setLocalDescription(localDescription);
        socket.emit(socketEvent.RELAY_SESSION_DESCRIPTION, {
          peerId,
          sessionDescription: localDescription,
        });
      }
    },
    [peers, setPeer]
  );

  const handleRemovePeer = useCallback(
    ({ peerId }: { peerId: string }) => {
      console.log('Signaling server said to remove peer:', peerId);

      const peer = peers[peerId];
      peer && peer.connection.close();
      removePeer(peerId);
    },
    [peers, removePeer]
  );

  const handleSessionDescription = useCallback(
    async ({
      sessionDescription: remoteDescription,
      peerId,
    }: {
      peerId: string;
      sessionDescription: RTCSessionDescriptionInit;
    }) => {
      if (!socket) return;

      console.log(
        'Remote description received: ',
        remoteDescription.type,
        peerId
      );

      const peer = peers[peerId];
      if (!peer) return;

      const description = new RTCSessionDescription(remoteDescription);
      await peer.connection.setRemoteDescription(description);

      if (remoteDescription.type === 'offer') {
        console.log('Creating description reply to ', peerId);
        const localDescription = await peer.connection.createAnswer();
        await peer.connection.setLocalDescription(localDescription);
        socket.emit(socketEvent.RELAY_SESSION_DESCRIPTION, {
          peerId,
          sessionDescription: localDescription,
        });
      }
    },
    [peers]
  );

  const handleICECandidate = useCallback(
    ({
      iceCandidate,
      peerId,
    }: {
      peerId: string;
      iceCandidate: RTCIceCandidateInit;
    }) => {
      if (!socket) return;
      const peer = peers[peerId];
      if (!peer) return;

      peer.connection.addIceCandidate(new RTCIceCandidate(iceCandidate));
    },
    [peers]
  );

  useEffect(() => {
    if (!socket) return;
    console.log('Join exam', examId);
    socket.emit(socketEvent.JOIN_EXAM, { examId });
  }, [examId]);

  useEffect(() => {
    if (!socket) return;
    socket.off(socketEvent.ADD_PEER);
    socket.on(socketEvent.ADD_PEER, handleAddPeer);
  }, [handleAddPeer]);

  useEffect(() => {
    if (!socket) return;
    socket.off(socketEvent.ICE_CANDIDATE);
    socket.on(socketEvent.ICE_CANDIDATE, handleICECandidate);
  }, [handleICECandidate]);

  useEffect(() => {
    if (!socket) return;
    socket.off(socketEvent.SESSION_DESCRIPTION);
    socket.on(socketEvent.SESSION_DESCRIPTION, handleSessionDescription);
  }, [handleSessionDescription]);

  useEffect(() => {
    if (!socket) return;
    socket.off(socketEvent.REMOVE_PEER);
    socket.on(socketEvent.REMOVE_PEER, handleRemovePeer);
  }, [handleRemovePeer]);

  useEffect(() => {
    R.keys(peers).forEach((peerId) => {
      const peer = peers[peerId];
      if (peer.user.tier !== userTierType.STUDENT) {
        // peer.connection.addTrack(new MediaStreamTrack(), ...mediaStreams);
      }
    });
  }, [mediaStreams]);
};
