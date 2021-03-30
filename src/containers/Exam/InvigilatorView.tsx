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
import { UsergroupAddOutlined } from '@ant-design/icons';

type Props = {
  exam: PopulatedExam;
};

export const InvigilatorView = ({ exam }: Props) => {
  const { peers } = useExamRTC({ examId: exam._id, streamReady: true });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { socket } = useSocket();
  const [userAlert, setUserAlert] = useState<{
    [id: string]: examAlertType[];
  }>({});

  const handleExamAlert = useCallback(({ peerId, alert }) => {
    setUserAlert((perv) => R.assoc(peerId, alert, perv));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.off(socketEvent.EXAM_ALERT);
    socket.on(socketEvent.EXAM_ALERT, handleExamAlert);
  }, [handleExamAlert]);

  const userArray = useMemo(() => {
    const streamsArray = R.keys(peers).reduce<
      {
        connection: RTCPeerConnection;
        user: PureUser;
        streams: MediaStream[];
        socketId: string;
        alert: examAlertType[];
      }[]
    >((acc, socketId) => {
      const item = peers[socketId];
      const alert = R.propOr<
        examAlertType[],
        typeof userAlert,
        examAlertType[]
      >([], String(socketId), userAlert);
      return [...acc, { socketId: String(socketId), alert, ...item }];
    }, []);

    const groupedStream = R.groupBy(({ user: { _id } }) => _id, streamsArray);

    return R.keys(groupedStream).reduce<
      {
        user: PureUser;
        streams: MediaStream[];
        alert: examAlertType[];
      }[]
    >((acc, userId) => {
      const streams = groupedStream[userId];

      const groupedItem = streams.reduce<{
        user: PureUser;
        streams: MediaStream[];
        alert: examAlertType[];
      }>(
        (acc, item) => {
          return {
            user: item.user,
            streams: [...acc.streams, ...item.streams],
            alert: [...acc.alert, ...item.alert],
          };
        },
        {
          user: streams[0].user,
          streams: [],
          alert: [],
        }
      );

      return [...acc, groupedItem];
    }, []);
  }, [peers, userAlert]);

  const selectedUser = useMemo(
    () =>
      selectedUserId
        ? R.find(({ user: { _id } }) => _id === selectedUserId, userArray)
        : null,
    [userArray, selectedUserId]
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
      </PreviewWrapper>
      <UserWrapper>
        {userArray.map(({ streams, user: { _id, username }, alert }) => (
          <PreviewListItem
            key={_id}
            onClick={() => {
              setSelectedUserId(_id);
            }}
          >
            {R.includes(examAlertType.MULTI_PEOPLE, alert) && <UserAlertIcon />}
            <Preview stream={streams[0]} key={_id} />
            <NameWrapper>{username}</NameWrapper>
          </PreviewListItem>
        ))}
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
