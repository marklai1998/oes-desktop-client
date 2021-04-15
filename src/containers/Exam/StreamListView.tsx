import React, { useEffect, useMemo, useState } from 'react';
import { useUnmount } from 'react-use';
import styled from 'styled-components';
import * as R from 'ramda';
import { StreamPreview } from './StreamPreview';
import { mediaStreamType } from '../../constants/mediaStreamType';
import {
  FaceDetection,
  FaceMatcher,
  WithFaceDescriptor,
  WithFaceLandmarks,
  FaceLandmarks68,
  FaceMatch,
} from 'face-api.js';
import { FaceList } from './FaceList';
import { v4 as uuid } from 'uuid';
import { useSocket } from '../../hooks/useSocket';
import { socketEvent } from '../../constants/socketEvent';
import { examAlertType } from '../../constants/examAlertType';
import { useAuth } from '../../hooks/useAuth';

type Props = {
  examId: string;
  streams: { stream: MediaStream; type: mediaStreamType }[];
  faceMatcher?: FaceMatcher;
};

export const StreamListView = ({ examId, streams, faceMatcher }: Props) => {
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const { user: self } = useAuth();
  const [faceDetection, setFaceDetection] = useState<{
    [key: string]: {
      id: string;
      data: WithFaceDescriptor<
        WithFaceLandmarks<{ detection: FaceDetection }, FaceLandmarks68>
      >;
      image: ImageData;
      faceMatch?: FaceMatch;
    }[];
  }>({});
  const { socket } = useSocket();

  useUnmount(() => {
    streams.forEach(({ stream }) => {
      const tracks = stream.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });
    });
  });

  useEffect(() => {
    const firstStream = R.head(streams);
    setSelectedStreamId(firstStream ? firstStream.stream.id : null);
  }, [streams]);

  const selectedStream = useMemo(
    () => R.find(({ stream: { id } }) => id === selectedStreamId, streams),
    [selectedStreamId, streams]
  );

  const selectedStreamFaces = useMemo(
    () => (selectedStreamId ? R.prop(selectedStreamId, faceDetection) : null),
    [selectedStreamId, faceDetection]
  );

  useEffect(() => {
    if (!socket) return;
    const hasMultipleFace = R.any((key) => {
      const faces = R.propOr<
        typeof faceDetection[string],
        typeof faceDetection,
        typeof faceDetection[string]
      >([], String(key), faceDetection);
      return faces.length > 1;
    }, R.keys(faceDetection));

    const verified = R.any((key) => {
      const faces = R.propOr<
        typeof faceDetection[string],
        typeof faceDetection,
        typeof faceDetection[string]
      >([], String(key), faceDetection);
      return R.any(
        ({ faceMatch }) =>
          Boolean(faceMatch && self && faceMatch.label === self.username),
        faces
      );
    }, R.keys(faceDetection));

    socket.emit(socketEvent.PEER_STATUS, {
      examId,
      peerId: socket.id,
      verified,
      alert: hasMultipleFace ? [examAlertType.MULTI_PEOPLE] : [],
    });
  }, [examId, faceDetection, self]);

  return (
    <>
      <PreviewList>
        {streams.map(({ stream, type }) => (
          <PreviewListItem
            key={stream.id}
            onClick={() => {
              setSelectedStreamId(stream.id);
            }}
          >
            <Preview
              stream={stream}
              faceDetection={type === mediaStreamType.CAMERA}
              onFaceDetection={(faces) => {
                setFaceDetection((prev) =>
                  R.assoc(
                    stream.id,
                    faces.map((data) => ({
                      ...data,
                      id: uuid(),
                      faceMatch: faceMatcher
                        ? faceMatcher.findBestMatch(data.data.descriptor)
                        : undefined,
                    })),
                    prev
                  )
                );
              }}
              faceMatcher={faceMatcher}
            />
          </PreviewListItem>
        ))}
      </PreviewList>
      <EnlargedPreviewWrapper>
        {selectedStream && <Preview stream={selectedStream.stream} />}
        {selectedStreamFaces && <FaceList list={selectedStreamFaces} />}
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
  display: flex;
  overflow: auto;
`;
