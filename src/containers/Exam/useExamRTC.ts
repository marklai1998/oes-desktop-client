import { useUnmount } from 'react-use';
import { socketEvent } from './../../constants/socketEvent';
import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { PureUser } from '../../types/user';
import { userTierType } from '../../constants/userTierType';
import { message } from 'antd';
import * as R from 'ramda';
import { useAuth } from '../../hooks/useAuth';

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
  streamReady = false,
}: {
  examId: string;
  mediaStreams?: MediaStream[];
  streamReady?: boolean;
}) => {
  const { socket } = useSocket();
  const { isStudent, user: self } = useAuth();
  const [peers, setPeers] = useState<{
    [peerId: string]: {
      connection: RTCPeerConnection;
      user: PureUser;
      streams: MediaStream[];
    };
  }>({});

  const handleAddPeer = useCallback(
    async ({ peerId, user }: { peerId: string; user: PureUser }) => {
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

      setPeers((prev) => ({
        ...prev,
        [peerId]: {
          connection: peerConnection,
          user,
          streams: [],
        },
      }));

      peerConnection.onicecandidate = (event) => {
        if (!event.candidate) return;
        console.log('Create ICE candidate for', peerId);
        socket.emit(socketEvent.RELAY_ICE_CANDIDATE, {
          peerId,
          iceCandidate: event.candidate,
        });
      };

      peerConnection.onconnectionstatechange = (e) => {
        const connectionState = e.target
          ? (e.target as RTCPeerConnection).connectionState
          : 'UNKNOWN';
        console.log(
          'Connection status changed for',
          peerId,
          ' to ',
          connectionState
        );
      };

      peerConnection.ontrack = (event) => {
        console.log('add Stream', event);

        setPeers((prev) => {
          const item = prev[peerId];

          return {
            ...prev,
            [peerId]: {
              ...item,
              streams: [...item.streams, ...event.streams],
            },
          };
        });
      };

      if (!R.isEmpty(mediaStreams)) {
        mediaStreams.forEach((stream) => {
          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack) {
            peerConnection.addTrack(videoTrack, stream);
          }
        });
      } else {
        // teacher has no stream, connection won't happen without stream
        peerConnection.addTransceiver('video');
      }

      if (
        isStudent &&
        (user.tier === userTierType.TEACHER || user.tier === userTierType.ADMIN)
      ) {
        console.log('Creating RTC offer to ', peerId);
        const localDescription = await peerConnection.createOffer();

        peerConnection.setLocalDescription(localDescription);
        socket.emit(socketEvent.RELAY_SESSION_DESCRIPTION, {
          peerId,
          sessionDescription: localDescription,
        });
      }
    },
    [peers, mediaStreams]
  );

  const handleRemovePeer = useCallback(
    ({ peerId }: { peerId: string }) => {
      console.log('Remove peer ', peerId);

      const peer = peers[peerId];
      peer && peer.connection.close();
      setPeers((prev) => R.dissoc(peerId, prev));
    },
    [peers]
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
        'Remote description received ',
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
    if (!socket || !streamReady) return;
    console.log('Join exam', examId);
    socket.emit(socketEvent.JOIN_EXAM, { examId });
  }, [streamReady, examId]);

  useUnmount(() => {
    if (!socket) return;
    socket.emit(socketEvent.LEAVE_EXAM, { examId });
  });

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

  return { peers };
};
