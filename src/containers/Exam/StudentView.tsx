import { desktopCapturer } from 'electron';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PopulatedExam } from '../../types/exam';
import * as R from 'ramda';
import { useExamRTC } from './useExamRTC';
import { useCamera } from '../../hooks/useCamera';
import { StreamListView } from './StreamListView';
import { useAuth } from '../../hooks/useAuth';
import { message } from 'antd';
import { usePreviousDistinct, useUpdateEffect } from 'react-use';
import { mediaStreamType } from '../../constants/mediaStreamType';
import {
  detectAllFaces,
  FaceMatcher,
  env,
  nets,
  LabeledFaceDescriptors,
} from 'face-api.js';
import { PageLoading } from '../../components/PageLoading';
import styled from 'styled-components';

type Props = {
  exam: PopulatedExam;
};

export const StudentView = ({ exam }: Props) => {
  const { cameraList } = useCamera();
  const { user: self } = useAuth();
  const iconRef = useRef<HTMLImageElement>(null);
  const [desktopStream, setDesktopStream] = useState<MediaStream[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream[]>([]);
  const [faceMatcher, setFaceMatcher] = useState<FaceMatcher | undefined>();
  const [modelInitialized, setModelInitialized] = useState(false);
  const [referenceIconLoaded, setReferenceIconLoaded] = useState(false);

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

  const initFaceApi = async () => {
    env.monkeyPatch({
      Canvas: HTMLCanvasElement,
      Image: HTMLImageElement,
      ImageData: ImageData,
      Video: HTMLVideoElement,
      createCanvasElement: () => document.createElement('canvas'),
      createImageElement: () => document.createElement('img'),
    });
    await nets.ssdMobilenetv1.loadFromUri(
      'http://localhost:3000/models/ssd_mobilenetv1_model-weights_manifest.json'
    );
    await nets.faceLandmark68Net.loadFromUri(
      'http://localhost:3000/models/face_landmark_68_model-weights_manifest.json'
    );
    await nets.faceRecognitionNet.loadFromUri(
      'http://localhost:3000/models/face_recognition_model-weights_manifest.json'
    );

    setModelInitialized(true);
  };

  useEffect(() => {
    initDesktopStream();
    initCameraStream();
    initFaceApi();
  }, []);

  const initFaceMatcher = async () => {
    if (!iconRef.current || !self) return;
    const results = await detectAllFaces(iconRef.current)
      .withFaceLandmarks()
      .withFaceDescriptors();
    if (!results.length) {
      return;
    }

    // create FaceMatcher with automatically assigned labels
    // from the detection results for the reference image
    const faceMatcher = new FaceMatcher(
      new LabeledFaceDescriptors(
        self.username,
        results.map(({ descriptor }) => descriptor)
      )
    );
    setFaceMatcher(faceMatcher);
  };

  useEffect(() => {
    modelInitialized && referenceIconLoaded && initFaceMatcher();
  }, [iconRef, modelInitialized, referenceIconLoaded]);

  return (
    <>
      {self && (
        <Icon
          ref={iconRef}
          src={`http://localhost:3000/uploads/icons/${self._id}`}
          onLoad={() => {
            console.log('ref image loaded');
            setReferenceIconLoaded(true);
          }}
          crossOrigin="anonymous"
        />
      )}
      {modelInitialized ? (
        <StreamListView
          examId={exam._id}
          streams={[...allStreams, ...remoteStream]}
          faceMatcher={faceMatcher}
        />
      ) : (
        <PageLoading />
      )}
    </>
  );
};

const Icon = styled.img`
  display: none;
  position: fixed;
  z-index: 10000;
`;
