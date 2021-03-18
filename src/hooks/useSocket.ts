import { useEffect, useState } from 'react';
import constate from 'constate';
import { io, Socket } from 'socket.io-client';

export const [UserSocketProvider, useSocket] = constate(() => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    setSocket(io('http://localhost:3000'));
  }, []);

  return { socket };
});
