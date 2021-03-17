import React, { useEffect } from 'react';

import { Container, Image, Text } from './styles';
import { desktopCapturer } from 'electron';

const Greetings: React.FC = () => {
  const handleStream = (stream) => {
    const video = document.querySelector('video');
    video.srcObject = stream;
    video.onloadedmetadata = (e) => video.play();
  };

  const handleError = (e) => {
    console.log(e);
  };

  useEffect(() => {
    desktopCapturer
      .getSources({ types: ['screen'] })
      .then(async (sources) => {
        console.log(sources);
        for (const source of sources) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: source.id,
                  minWidth: 1280,
                  maxWidth: 1280,
                  minHeight: 720,
                  maxHeight: 720,
                },
              },
            });
            handleStream(stream);
          } catch (e) {
            handleError(e);
          }
          return;
        }
      })
      .catch((e) => {
        console.log(e);
      });
  });

  return (
    <Container>
      <Image
        src="https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg"
        alt="ReactJS logo"
      />
      <Text>
        A lectron boilerplate including TypeScript, React, Jest and ESLint.
      </Text>
      <video />
    </Container>
  );
};

export default Greetings;
