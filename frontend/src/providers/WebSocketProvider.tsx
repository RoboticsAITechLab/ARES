"use client";

import { useEffect, createContext, useContext } from "react";
import { AresWebSocketClient } from "@/services/websocket/websocketClient";

const WebSocketContext = createContext<AresWebSocketClient | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only run on client side
    const wsClient = AresWebSocketClient.getInstance();
    wsClient.connect();

    return () => {
      wsClient.disconnect();
    };
  }, []);

  const wsClient = AresWebSocketClient.getInstance();

  return (
    <WebSocketContext.Provider value={wsClient}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
