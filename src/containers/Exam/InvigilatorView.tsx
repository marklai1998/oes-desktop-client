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

  const peersArray = useMemo(
    () =>
      R.keys(peers).reduce<
        {
          connection: RTCPeerConnection;
          user: PureUser;
          streams: MediaStream[];
          socketId: string;
        }[]
      >((acc, socketId) => {
        const item = peers[socketId];
        return [...acc, { socketId: String(socketId), ...item }];
      }, []),
    [peers]
  );

  const selectedPeer = useMemo(
    () => (selectedPeerId ? peers[selectedPeerId] : null),
    [peers, selectedPeerId]
  );

  return (
    <Wrapper>
      <PreviewWrapper>
        {selectedPeer && <StreamListView streams={selectedPeer.streams} />}
      </PreviewWrapper>
      <UserWrapper>
        {peersArray.map(({ socketId, streams }) => (
          <PreviewListItem
            key={socketId}
            onClick={() => {
              setSelectedPeerId(socketId);
            }}
          >
            <Preview stream={streams[0]} key={socketId} />
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
`;

const Preview = styled(StreamPreview)`
  height: 100%;
  width: 100%;
`;
