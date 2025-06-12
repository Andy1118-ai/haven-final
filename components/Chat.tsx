import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useChat } from '../hooks/useChat';
import { format } from 'date-fns';

interface ChatProps {
  receiverId: string;
  receiverName: string;
}

export function Chat({ receiverId, receiverName }: ChatProps) {
  const [message, setMessage] = useState('');
  const { messages, isConnected, isTyping, error, sendMessage, updateTypingStatus } = useChat(receiverId);
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  const handleTyping = (text: string) => {
    setMessage(text);
    updateTypingStatus(true);
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isOwnMessage = item.senderId === receiverId;
    const messageTime = format(new Date(item.timestamp), 'HH:mm');

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <View style={styles.messageContent}>
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.messageTime}>{messageTime}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {!isConnected && (
        <View style={styles.connectionStatus}>
          <ActivityIndicator size="small" color="#666" />
          <Text style={styles.connectionText}>Connecting...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      />

      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{receiverName} is typing...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={handleTyping}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
        />
        <View style={styles.sendButton} onTouchEnd={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#fff',
  },
  connectionText: {
    marginLeft: 8,
    color: '#666',
  },
  errorContainer: {
    padding: 8,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 8,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageContent: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    padding: 8,
    backgroundColor: '#fff',
  },
  typingText: {
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2196f3',
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 