import React, { useEffect, useRef } from 'react';

type Props = {
  stream: MediaStream;
};

export const StreamPreview = ({ stream, ...rest }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    videoRef.current.onloadedmetadata = (e) =>
      videoRef.current && videoRef.current.play();
  }, [stream, videoRef.current]);

  return <video ref={videoRef} {...rest} muted />;
};
