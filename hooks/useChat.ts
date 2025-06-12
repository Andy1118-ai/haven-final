import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  senderType: 'USER' | 'THERAPIST' | 'AI';
  timestamp: string;
}

interface ChatState {
  messages: Message[];
  isConnected: boolean;
  isTyping: boolean;
  error: string | null;
}

export function useChat(receiverId: string) {
  const { token } = useAuth();
  const [state, setState] = useState<ChatState>({
    messages: [],
    isConnected: false,
    isTyping: false,
    error: null,
  });
  const ws = useRef<WebSocket | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!token) return;

    try {
      ws.current = new WebSocket(`ws://localhost:3000/api/chat/ws?token=${token}`);

      ws.current.onopen = () => {
        setState(prev => ({ ...prev, isConnected: true, error: null }));
      };

      ws.current.onclose = () => {
        setState(prev => ({ ...prev, isConnected: false }));
        // Attempt to reconnect after 5 seconds
        setTimeout(connect, 5000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to connect to chat server',
        }));
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'chat':
            setState(prev => ({
              ...prev,
              messages: [...prev.messages, data.message],
            }));
            break;
          case 'typing':
            setState(prev => ({
              ...prev,
              isTyping: data.isTyping,
            }));
            break;
          case 'error':
            setState(prev => ({
              ...prev,
              error: data.message,
            }));
            break;
        }
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to establish WebSocket connection',
      }));
    }
  }, [token]);

  // Load chat history
  const loadChatHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/chat/history?receiverId=${receiverId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load chat history');
      }

      setState(prev => ({
        ...prev,
        messages: data,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load chat history',
      }));
    }
  }, [receiverId, token]);

  // Send message
  const sendMessage = useCallback((content: string, senderType: 'USER' | 'THERAPIST' | 'AI' = 'USER') => {
    if (!ws.current || !state.isConnected) {
      setState(prev => ({
        ...prev,
        error: 'Not connected to chat server',
      }));
      return;
    }

    try {
      ws.current.send(JSON.stringify({
        type: 'chat',
        receiverId,
        content,
        senderType,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to send message',
      }));
    }
  }, [receiverId, state.isConnected]);

  // Update typing status
  const updateTypingStatus = useCallback((isTyping: boolean) => {
    if (!ws.current || !state.isConnected) return;

    // Clear existing timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Send typing status
    ws.current.send(JSON.stringify({
      type: 'typing',
      receiverId,
      isTyping,
    }));

    // Set timeout to automatically set typing to false after 3 seconds
    if (isTyping) {
      typingTimeout.current = setTimeout(() => {
        updateTypingStatus(false);
      }, 3000);
    }
  }, [receiverId, state.isConnected]);

  // Initialize chat
  useEffect(() => {
    connect();
    loadChatHistory();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [connect, loadChatHistory]);

  return {
    ...state,
    sendMessage,
    updateTypingStatus,
  };
} 