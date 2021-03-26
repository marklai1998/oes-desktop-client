import {
  FaceDetection,
  FaceLandmarks68,
  FaceMatcher,
  WithFaceDescriptor,
  WithFaceLandmarks,
} from 'face-api.js';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { v4 as uuid } from 'uuid';

type Props = {
  list: {
    data: WithFaceDescriptor<
      WithFaceLandmarks<{ detection: FaceDetection }, FaceLandmarks68>
    >;
    image: ImageData;
  }[];
  faceMatcher?: FaceMatcher;
};

const PreviewItem = ({
  data,
  faceMatcher,
}: {
  data: {
    data: WithFaceDescriptor<
      WithFaceLandmarks<{ detection: FaceDetection }, FaceLandmarks68>
    >;
    image: ImageData;
  };
  faceMatcher?: FaceMatcher;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bestMatch, setBestMatch] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas2D = canvasRef.current.getContext('2d');
    if (!canvas2D) return;
    canvasRef.current.width = data.image.width;
    canvasRef.current.height = data.image.height;
    canvas2D.putImageData(data.image, 0, 0);

    if (!faceMatcher) return;
    const bestMatch = faceMatcher.findBestMatch(data.data.descriptor);
    setBestMatch(bestMatch.toString());
  }, [data]);

  return (
    <PreviewItemWrapper>
      <Canvas ref={canvasRef} />
      {bestMatch && <NameWrapper>{bestMatch}</NameWrapper>}
    </PreviewItemWrapper>
  );
};

export const FaceList = ({ list, faceMatcher }: Props) => {
  return (
    <Wrapper>
      {list.map((data) => (
        <PreviewItem data={data} key={uuid()} faceMatcher={faceMatcher} />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100px;
  flex-shrink: 0;
  background-color: #2f2f2f;
  overflow: auto;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  max-width: 100px;
  max-height: 100px;
`;

const PreviewItemWrapper = styled.div`
  height: 100px;
  width: 100px;
  padding: 1px;
  box-shadow: inset 0px 0px 0px 1px #4c4c4c;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
`;

const NameWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #979696;
  color: #fff;
  padding: 4px;
  font-size: 12px;
`;
