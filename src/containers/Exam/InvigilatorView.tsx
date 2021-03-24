import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { PopulatedExam } from '../../types/exam';
import { useExamRTC } from './useExamRTC';
import * as R from 'ramda';
import { PureUser } from '../../types/user';
import { StreamPreview } from './StreamPreview';
import { StreamListView } from './StreamListView';

type Props = {
  exam: PopulatedExam;
};

export const InvigilatorView = ({ exam }: Props) => {
  const { peers } = useExamRTC({ examId: exam._id, streamReady: true });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const userArray = useMemo(() => {
    const streamsArray = R.keys(peers).reduce<
      {
        connection: RTCPeerConnection;
        user: PureUser;
        streams: MediaStream[];
        socketId: string;
      }[]
    >((acc, socketId) => {
      const item = peers[socketId];
      return [...acc, { socketId: String(socketId), ...item }];
    }, []);

    const groupedStream = R.groupBy(({ user: { _id } }) => _id, streamsArray);

    return R.keys(groupedStream).reduce<
      {
        user: PureUser;
        streams: MediaStream[];
      }[]
    >((acc, userId) => {
      const streams = groupedStream[userId];

      const groupedItem = streams.reduce<{
        user: PureUser;
        streams: MediaStream[];
      }>(
        (acc, item) => {
          return {
            user: item.user,
            streams: [...acc.streams, ...item.streams],
          };
        },
        {
          user: streams[0].user,
          streams: [],
        }
      );

      return [...acc, groupedItem];
    }, []);
  }, [peers]);

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
        {selectedUser && <StreamListView streams={selectedUser.streams} />}
      </PreviewWrapper>
      <UserWrapper>
        {userArray.map(({ streams, user: { _id, username } }) => (
          <PreviewListItem
            key={_id}
            onClick={() => {
              setSelectedUserId(_id);
            }}
          >
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
