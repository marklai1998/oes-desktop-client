import constate from 'constate';
import { useEffect, useState } from 'react';
import { socketEvent } from '../constants/socketEvent';
import { dayjs } from '../utils/dayjs';
import { useSocket } from './useSocket';

export const [UseTimeProvider, useTime, useDate] = constate(
  () => {
    const [time, setTime] = useState(dayjs().toISOString());
    const { socket } = useSocket();

    useEffect(() => {
      socket &&
        socket.on(socketEvent.TIME, (time: string) => {
          setTime(time);
        });
    }, [socket]);

    return time;
  },
  (time) => time,
  (time) => dayjs(time).startOf('day').toISOString()
);
