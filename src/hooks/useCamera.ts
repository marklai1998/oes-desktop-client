import * as R from 'ramda';
import constate from 'constate';
import { useCallback, useEffect, useState } from 'react';

export const [UseCameraProvider, useCamera] = constate(() => {
  const [hasCameraSupport] = useState('mediaDevices' in navigator);

  const [cameraList, setCameraList] = useState<InputDeviceInfo[] | null>(null);

  const initCameraList = useCallback(async () => {
    try {
      if (
        !hasCameraSupport ||
        !R.hasIn('enumerateDevices', navigator.mediaDevices)
      ) {
        setCameraList([]);
        return;
      }

      const deviceList = await navigator.mediaDevices.enumerateDevices();

      const cameraList = deviceList.filter<InputDeviceInfo>(
        (device): device is InputDeviceInfo => device.kind === 'videoinput'
      );

      setCameraList(cameraList);
    } catch (e) {
      alert('Unable to list device.\n\n' + e);
    }
  }, [hasCameraSupport]);

  useEffect(() => {
    initCameraList();
  }, [hasCameraSupport, initCameraList]);

  return {
    cameraList: cameraList || [],
    hasCameraSupport,
    initializingCamera: R.isNil(cameraList),
  };
});
