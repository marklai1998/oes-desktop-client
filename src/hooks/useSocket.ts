import { useEffect, useState } from 'react';
import constate from 'constate';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

export const [UserSocketProvider, useSocket] = constate(() => {
  const { isLoggedIn } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('id_token');
    setSocket(
      io('http://localhost:3000', {
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
  }, [isLoggedIn]);

  return { socket };
});
