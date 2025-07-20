import { io } from 'socket.io-client';

const socket = io(`${process.env.serverBaseUrl}`, {
  autoConnect: false,
  withCredentials: true
});

export default socket;