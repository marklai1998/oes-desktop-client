import { desktopCapturer } from 'electron';
import React, { useEffect, useMemo, useState } from 'react';
import { PopulatedExam } from '../../types/exam';
import * as R from 'ramda';
import { useExamRTC } from './useExamRTC';
import { useCamera } from '../../hooks/useCamera';
import { StreamListView } from './StreamListView';
import { useAuth } from '../../hooks/useAuth';
import { message } from 'antd';
import { usePreviousDistinct, useUpdateEffect } from 'react-use';
import { mediaStreamType } from '../../constants/mediaStreamType';

type Props = {
  exam: PopulatedExam;
};

export const StudentView = ({ exam }: Props) => {
  const { cameraList } = useCamera();
  const { user: self } = useAuth();
  const [desktopStream, setDesktopStream] = useState<MediaStream[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream[]>([]);

  const allStreams = useMemo(
    () => [
      ...cameraStream.map((stream) => ({
        stream,
        type: mediaStreamType.CAMERA,
      })),
      ...desktopStream.map((stream) => ({
        stream,
        type: mediaStreamType.SCREEN,
      })),
    ],
    [desktopStream, cameraStream]
  );

  const { peers } = useExamRTC({
    examId: exam._id,
    mediaStreams: R.pluck('stream', allStreams),
    streamReady:
      !R.isEmpty(desktopStream) &&
      (R.isEmpty(cameraList) ? true : !R.isEmpty(cameraStream)),
  });

  const remoteStream = useMemo(
    () =>
      R.keys(peers).reduce<{ stream: MediaStream; type: mediaStreamType }[]>(
        (acc, key) => {
          const peer = peers[key];
          if (self && peer.user._id === self._id) {
            return [
              ...acc,
              ...peer.streams.map((stream) => ({
                stream,
                type: mediaStreamType.CAMERA,
              })),
            ];
          }
          return acc;
        },
        []
      ),
    [peers]
  );

  const prevLength = usePreviousDistinct(remoteStream.length);

  useUpdateEffect(() => {
    if (remoteStream.length < Number(prevLength)) {
      message.info('Remote camera has been removed to the exam');
    } else {
      message.info('Remote camera has been added to the exam');
    }
  }, [remoteStream.length]);

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

  return <StreamListView streams={[...allStreams, ...remoteStream]} />;
};
