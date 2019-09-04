import * as React from "react";
import { SocketService } from "./SocketService";

// create new context
const SocketContext: React.Context<SocketService> = React.createContext(
    new SocketService()
);

// functional component context hook
export const useSocket = () => React.useContext(SocketContext);

export default SocketContext;
