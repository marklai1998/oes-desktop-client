import React, { useEffect, useRef, useState } from 'react';
import { useRafLoop } from 'react-use';
import styled from 'styled-components';
import { detectAllFaces, nets, env, FaceDetection } from 'face-api.js';
import { debounce } from 'throttle-debounce';

type Props = {
  stream: MediaStream;
  onFrame?: (imageData: ImageData) => void;
  faceDetection?: boolean;
  onFaceDetection?: (
    faces: { data: FaceDetection; image: ImageData }[]
  ) => void;
};

export const StreamPreview = ({
  stream,
  onFrame,
  faceDetection = false,
  onFaceDetection,
  ...rest
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [modelInitialized, setModelInitialized] = useState(false);

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

        if (modelInitialized && onFaceDetection) {
          const faces = await detectAllFaces(canvasElement);

          onFaceDetection(
            faces.map((data) => {
              const imageData = canvas2D.getImageData(
                data.box.x,
                data.box.y,
                data.box.width,
                data.box.height
              );
              return { data, image: imageData };
            })
          );
        }
      }
    }),
    false
  );

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
    setModelInitialized(true);
  };

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    videoRef.current.onloadedmetadata = (e) =>
      videoRef.current && videoRef.current.play();
    faceDetection && loopStart();
    faceDetection && initFaceApi();
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
