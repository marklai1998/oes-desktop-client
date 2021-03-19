import { desktopCapturer } from 'electron';
import React, { useEffect, useMemo, useState } from 'react';
import { PopulatedExam } from '../../types/exam';
import { StreamPreview } from './StreamPreview';
import * as R from 'ramda';
import { useExamRTC } from './useExamRTC';
import { useCamera } from '../../hooks/useCamera';
import { StreamListView } from './StreamListView';

type Props = {
  exam: PopulatedExam;
};

export const StudentView = ({ exam }: Props) => {
  const { cameraList } = useCamera();
  const [desktopStream, setDesktopStream] = useState<MediaStream[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream[]>([]);

  const allStreams = useMemo(() => [...cameraStream, ...desktopStream], [
    desktopStream,
    cameraStream,
  ]);

  useExamRTC({
    examId: exam._id,
    mediaStreams: allStreams,
    streamReady:
      !R.isEmpty(desktopStream) &&
      (R.isEmpty(cameraList) ? true : !R.isEmpty(cameraStream)),
  });

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

  return <StreamListView streams={allStreams} />;
};
