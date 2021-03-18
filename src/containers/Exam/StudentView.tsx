import { desktopCapturer } from 'electron';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { PopulatedExam } from '../../types/exam';
import { StreamPreview } from './StreamPreview';
import * as R from 'ramda';
import { useUnmount } from 'react-use';
import { useExamRTC } from './useExamRTC';

type Props = {
  exam: PopulatedExam;
};

export const StudentView = ({ exam }: Props) => {
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);

  const [desktopStream, setDesktopStream] = useState<MediaStream[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream[]>([]);

  const allStreams = useMemo(() => [...desktopStream, ...cameraStream], [
    desktopStream,
    cameraStream,
  ]);

  useExamRTC({ examId: exam._id, mediaStreams: allStreams });

  const initDesktopStream = async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    const streams = await Promise.all(
      sources.map(async (source) =>
        navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: source.id,
              minHeight: 720,
              maxHeight: 720,
            },
          },
        } as any)
      )
    );
    setDesktopStream(streams);
  };

  const initCameraStream = async () => {
    const streams = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setCameraStream([streams]);
  };

  useEffect(() => {
    initDesktopStream();
    initCameraStream();
  }, []);

  useUnmount(() => {
    allStreams.forEach((stream) => {
      const tracks = stream.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });
    });
  });

  useEffect(() => {
    const firstStream = R.head(allStreams);
    setSelectedStreamId(firstStream ? firstStream.id : null);
  }, [allStreams]);

  const selectedStream = useMemo(
    () => R.find(({ id }) => id === selectedStreamId, allStreams),
    [selectedStreamId, allStreams]
  );

  return (
    <>
      <PreviewList>
        {allStreams.map((stream) => (
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
