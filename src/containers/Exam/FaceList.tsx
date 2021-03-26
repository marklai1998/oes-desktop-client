import { FaceDetection } from 'face-api.js';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import { v4 as uuid } from 'uuid';

type Props = {
  list: { data: FaceDetection; image: ImageData }[];
};

const PreviewItem = ({
  data,
}: {
  data: { data: FaceDetection; image: ImageData };
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas2D = canvasRef.current.getContext('2d');
    if (!canvas2D) return;
    canvasRef.current.width = data.image.width;
    canvasRef.current.height = data.image.height;
    canvas2D.putImageData(data.image, 0, 0);
  }, [data]);

  return <Canvas ref={canvasRef} />;
};

export const FaceList = ({ list }: Props) => {
  return (
    <Wrapper>
      {list.map((data) => (
        <PreviewItem data={data} key={uuid()} />
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
