import React, { useEffect, useRef } from 'react';
import { useRafLoop } from 'react-use';
import styled from 'styled-components';
import {
  detectAllFaces,
  FaceDetection,
  FaceMatcher,
  WithFaceLandmarks,
  WithFaceDescriptor,
  FaceLandmarks68,
} from 'face-api.js';
import { debounce } from 'throttle-debounce';

type Props = {
  stream: MediaStream;
  onFrame?: (imageData: ImageData) => void;
  faceDetection?: boolean;
  onFaceDetection?: (
    faces: {
      data: WithFaceDescriptor<
        WithFaceLandmarks<
          {
            detection: FaceDetection;
          },
          FaceLandmarks68
        >
      >;
      image: ImageData;
    }[]
  ) => void;
  faceMatcher?: FaceMatcher;
};

export const StreamPreview = ({
  stream,
  onFrame,
  faceDetection = false,
  onFaceDetection,
  faceMatcher,
  ...rest
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loopStop, loopStart] = useRafLoop(
    debounce(1000, async () => {
      const canvasElement = canvasRef.current;
      const videoElement = videoRef.current;
      if (
        canvasElement &&
        videoElement &&
        videoElement.readyState === videoElement.HAVE_ENOUGH_DATA
      ) {
        const canvas2D = canvasElement.getContext('2d');
        if (!canvas2D) return;
        canvasElement.height = videoElement.videoHeight;
        canvasElement.width = videoElement.videoWidth;
        canvas2D.drawImage(
          videoElement,
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        const imageData = canvas2D.getImageData(
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        onFrame && onFrame(imageData);

        if (onFaceDetection) {
          const faces = await detectAllFaces(canvasElement)
            .withFaceLandmarks()
            .withFaceDescriptors();

          onFaceDetection(
            faces.map((data) => {
              const imageData = canvas2D.getImageData(
                data.alignedRect.box.x,
                data.alignedRect.box.y,
                data.alignedRect.box.width,
                data.alignedRect.box.height
              );
              return { data, image: imageData };
            })
          );
        }
      }
    }),
    false
  );

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    videoRef.current.onloadedmetadata = (e) =>
      videoRef.current && videoRef.current.play();
    faceDetection && loopStart();
    return () => {
      loopStop();
    };
  }, [stream, videoRef.current, loopStop]);

  return (
    <>
      <video ref={videoRef} {...rest} muted />
      <Canvas ref={canvasRef} />
    </>
  );
};

const Canvas = styled.canvas`
  display: none;
`;
