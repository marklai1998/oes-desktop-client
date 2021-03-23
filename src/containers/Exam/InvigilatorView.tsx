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
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);

  const peersArray = useMemo(() => {
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
    return streamsArray.reduce<typeof streamsArray>((acc, item) => {
      const index = R.findIndex(
        ({ user: { _id } }) => _id === item.user._id,
        acc
      );

      if (index !== -1) {
        const originalItem = acc[index];
        console.log('hi', originalItem, item, [
          ...originalItem.streams,
          ...item.streams,
        ]);
        return R.assocPath(
          [index, 'streams'],
          [...originalItem.streams, ...item.streams],
          acc
        );
      }

      return [...acc, item];
    }, []);
  }, [peers]);

  const selectedPeer = useMemo(
    () =>
      selectedPeerId
        ? R.find(({ socketId }) => socketId === selectedPeerId, peersArray)
        : null,
    [peersArray, selectedPeerId]
  );

  console.log(selectedPeer);

  return (
    <Wrapper>
      <PreviewWrapper>
        {selectedPeer && <StreamListView streams={selectedPeer.streams} />}
      </PreviewWrapper>
      <UserWrapper>
        {peersArray.map(({ socketId, streams, user: { username } }) => (
          <PreviewListItem
            key={socketId}
            onClick={() => {
              setSelectedPeerId(socketId);
            }}
          >
            <Preview stream={streams[0]} key={socketId} />
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
