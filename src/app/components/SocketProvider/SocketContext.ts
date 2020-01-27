import * as React from 'react';
import { SocketService } from './SocketService';

const SocketContext: React.Context<SocketService> = React.createContext(new SocketService());

export const useSocket = () => React.useContext(SocketContext);

export default SocketContext;
