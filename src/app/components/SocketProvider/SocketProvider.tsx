import * as React from 'react';
import SocketContext from './SocketContext';

import { SocketService } from './SocketService';

const service = new SocketService();
const SocketProvider: React.StatelessComponent = props => (
    <SocketContext.Provider value={service}>{props.children}</SocketContext.Provider>
);

export default SocketProvider;
