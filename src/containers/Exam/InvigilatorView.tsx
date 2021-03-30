import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { PopulatedExam } from '../../types/exam';
import { useExamRTC } from './useExamRTC';
import * as R from 'ramda';
import { PureUser } from '../../types/user';
import { StreamPreview } from './StreamPreview';
import { StreamListView } from './StreamListView';
import { mediaStreamType } from '../../constants/mediaStreamType';
import { useSocket } from '../../hooks/useSocket';
import { examAlertType } from '../../constants/examAlertType';
import { socketEvent } from './../../constants/socketEvent';
import {
  UsergroupAddOutlined,
  CheckOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import { dayjs } from '../../utils/dayjs';

type Props = {
  exam: PopulatedExam;
};

export const InvigilatorView = ({ exam }: Props) => {
  const { peers } = useExamRTC({ examId: exam._id, streamReady: true });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { socket } = useSocket();
  const [userStatus, setUserStatus] = useState<{
    [id: string]: {
      alert: examAlertType[];
      verified: boolean;
    };
  }>({});
  const [userTranscript, setUserTranscript] = useState<{
    [id: string]: {
      transcript: string[];
      confidence: number;
      timestamp: string;
    }[];
  }>({});

  const handlePeerStatus = useCallback(({ peerId, ...rest }) => {
    setUserStatus((perv) => R.assoc(peerId, rest, perv));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.off(socketEvent.PEER_STATUS);
    socket.on(socketEvent.PEER_STATUS, handlePeerStatus);
  }, [handlePeerStatus]);

  const handleAddTranscript = useCallback(({ transcript, user }) => {
    setUserTranscript((prev) => {
      const originalTranscript = R.propOr<
        { transcript: string[]; confidence: number }[],
        typeof userTranscript,
        { transcript: string[]; confidence: number }[]
      >([], user._id, prev);
      const newTranscript = transcript.map((data: any) => ({
        ...data,
        timestamp: dayjs().toISOString(),
      }));

      return R.assoc(user._id, [...newTranscript, ...originalTranscript], prev);
    });
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.off(socketEvent.ADD_TRANSCRIPT);
    socket.on(socketEvent.ADD_TRANSCRIPT, handleAddTranscript);
  }, [handlePeerStatus]);

  const userArray = useMemo(() => {
    const streamsArray = R.keys(peers).reduce<
      {
        connection: RTCPeerConnection;
        user: PureUser;
        streams: MediaStream[];
        socketId: string;
        alert: examAlertType[];
        verified: boolean;
      }[]
    >((acc, socketId) => {
      const item = peers[socketId];

      const alert = R.pathOr<examAlertType[]>(
        [],
        [String(socketId), 'alert'],
        userStatus
      );

      const verified = R.pathOr<boolean>(
        false,
        [String(socketId), 'verified'],
        userStatus
      );

      return [...acc, { socketId: String(socketId), alert, verified, ...item }];
    }, []);

    const groupedStream = R.groupBy(({ user: { _id } }) => _id, streamsArray);

    return R.keys(groupedStream).reduce<
      {
        user: PureUser;
        streams: MediaStream[];
        alert: examAlertType[];
        verified: boolean;
      }[]
    >((acc, userId) => {
      const streams = groupedStream[userId];

      const groupedItem = streams.reduce<{
        user: PureUser;
        streams: MediaStream[];
        alert: examAlertType[];
        verified: boolean;
      }>(
        (acc, item) => {
          return {
            user: item.user,
            streams: [...acc.streams, ...item.streams],
            alert: [...acc.alert, ...item.alert],
            verified: acc.verified || item.verified,
          };
        },
        {
          user: streams[0].user,
          streams: [],
          alert: [],
          verified: false,
        }
      );

      return [...acc, groupedItem];
    }, []);
  }, [peers, userStatus, userTranscript]);

  const selectedUser = useMemo(
    () =>
      selectedUserId
        ? R.find(({ user: { _id } }) => _id === selectedUserId, userArray)
        : null,
    [userArray, selectedUserId]
  );

  const selectedTranscript = useMemo(
    () =>
      selectedUserId
        ? R.propOr<
            { transcript: string[]; confidence: number; timestamp: string }[],
            typeof userTranscript,
            { transcript: string[]; confidence: number; timestamp: string }[]
          >([], selectedUserId, userTranscript)
        : null,
    [selectedUserId, userTranscript]
  );

  return (
    <Wrapper>
      <PreviewWrapper>
        {selectedUser && (
          <StreamListView
            examId={exam._id}
            streams={selectedUser.streams.map((stream) => ({
              stream,
              type: mediaStreamType.UNKNOWN,
            }))}
          />
        )}
        {selectedTranscript && (
          <TranscriptWrapper>
            {selectedTranscript.map(({ transcript, confidence, timestamp }) => (
              <div key={timestamp}>
                {`[${dayjs(timestamp).format(
                  'YYYY-MM-DD hh:mm:ss'
                )}] ${transcript} (${confidence.toFixed(2)})`}
              </div>
            ))}
          </TranscriptWrapper>
        )}
      </PreviewWrapper>
      <UserWrapper>
        {userArray.map(
          ({ streams, user: { _id, username }, alert, verified }) => (
            <PreviewListItem
              key={_id}
              onClick={() => {
                setSelectedUserId(_id);
              }}
            >
              {!R.isEmpty(
                R.propOr<
                  {
                    transcript: string[];
                    confidence: number;
                    timestamp: string;
                  }[],
                  typeof userTranscript,
                  {
                    transcript: string[];
                    confidence: number;
                    timestamp: string;
                  }[]
                >([], _id, userTranscript)
              ) ? (
                <SoundOutlined />
              ) : (
                R.includes(examAlertType.MULTI_PEOPLE, alert) && (
                  <UserAlertIcon />
                )
              )}
              {verified && <UserVerifiedIcon />}
              <Preview stream={streams[0]} key={_id} />
              <NameWrapper>{username}</NameWrapper>
            </PreviewListItem>
          )
        )}
      </UserWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  overflow: auto;
`;

const PreviewWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

const UserWrapper = styled.div`
  width: 100px;
  flex-shrink: 0;
  background-color: #2f2f2f;
  overflow: auto;
`;

const PreviewListItem = styled.div`
  height: 100px;
  width: 100px;
  padding: 1px;
  box-shadow: inset 0px 0px 0px 1px #4c4c4c;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
`;

const Preview = styled(StreamPreview)`
  height: 100%;
  width: 100%;
`;

const NameWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #00000070;
  color: #fff;
  padding: 4px;
`;

const UserAlertIcon = styled(UsergroupAddOutlined)`
  background-color: red;
  color: #fff;
  position: absolute;
  padding: 4px;
  top: 4px;
  left: 4px;
  border-radius: 50%;
`;

const UserVerifiedIcon = styled(CheckOutlined)`
  background-color: #9a8bec;
  color: #fff;
  position: absolute;
  padding: 4px;
  top: 4px;
  right: 4px;
  border-radius: 50%;
`;

const TranscriptWrapper = styled.div`
  box-shadow: inset 0px 0px 0px 1px #4c4c4c;
  height: 100px;
  overflow: auto;
  color: #fff;
  padding: 0 8px;
`;
