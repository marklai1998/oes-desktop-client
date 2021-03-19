import React, { useEffect, useMemo, useState } from 'react';
import { useUnmount } from 'react-use';
import styled from 'styled-components';
import * as R from 'ramda';
import { StreamPreview } from './StreamPreview';

type Props = {
  streams: MediaStream[];
};

export const StreamListView = ({ streams }: Props) => {
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);

  useUnmount(() => {
    streams.forEach((stream) => {
      const tracks = stream.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });
    });
  });

  useEffect(() => {
    const firstStream = R.head(streams);
    setSelectedStreamId(firstStream ? firstStream.id : null);
  }, [streams]);

  const selectedStream = useMemo(
    () => R.find(({ id }) => id === selectedStreamId, streams),
    [selectedStreamId, streams]
  );

  return (
    <>
      <PreviewList>
        {streams.map((stream) => (
          <PreviewListItem
            key={stream.id}
            onClick={() => {
              setSelectedStreamId(stream.id);
            }}
          >
            <Preview stream={stream} />
          </PreviewListItem>
        ))}
      </PreviewList>
      <EnlargedPreviewWrapper>
        {selectedStream && <Preview stream={selectedStream} />}
      </EnlargedPreviewWrapper>
    </>
  );
};

const PreviewList = styled.div`
  width: 100%;
  height: 100px;
  overflow: auto;
  display: flex;
  flex-wrap: nowrap;
  box-shadow: inset 0px 0px 0px 1px #4c4c4c;
  box-sizing: border-box;
  flex-shrink: 0;
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

const EnlargedPreviewWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
`;
