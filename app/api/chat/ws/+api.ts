import { WebSocketServer } from 'ws';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const wss = new WebSocketServer({ noServer: true });

// Store active connections
const clients = new Map();

// Handle WebSocket connections
wss.on('connection', async (ws, req) => {
  try {
    // Extract token from query string
    const token = new URL(req.url!, 'ws://localhost').searchParams.get('token');
    
    if (!token) {
      ws.close(1008, 'Authentication required');
      return;
    }

    // Verify token
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;

    // Store connection
    clients.set(userId, ws);

    // Send connection success
    ws.send(JSON.stringify({
      type: 'connection',
      status: 'connected',
      userId,
    }));

    // Handle incoming messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'chat':
            await handleChatMessage(data, userId);
            break;
          case 'typing':
            handleTypingStatus(data, userId);
            break;
          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error handling message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message',
        }));
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      clients.delete(userId);
    });

  } catch (error) {
    console.error('WebSocket connection error:', error);
    ws.close(1011, 'Internal server error');
  }
});

// Handle chat messages
async function handleChatMessage(data: any, senderId: string) {
  try {
    const { receiverId, content, senderType } = data;

    // Save message to database
    const message = await prisma.chatMessage.create({
      data: {
        senderId,
        receiverId,
        content,
        senderType,
      },
    });

    // Send message to receiver if online
    const receiverWs = clients.get(receiverId);
    if (receiverWs) {
      receiverWs.send(JSON.stringify({
        type: 'chat',
        message,
      }));
    }

    // Send confirmation to sender
    const senderWs = clients.get(senderId);
    if (senderWs) {
      senderWs.send(JSON.stringify({
        type: 'chat',
        message,
        status: 'sent',
      }));
    }
  } catch (error) {
    console.error('Error handling chat message:', error);
    throw error;
  }
}

// Handle typing status
function handleTypingStatus(data: any, userId: string) {
  const { receiverId, isTyping } = data;
  const receiverWs = clients.get(receiverId);
  
  if (receiverWs) {
    receiverWs.send(JSON.stringify({
      type: 'typing',
      userId,
      isTyping,
    }));
  }
}

// Export WebSocket server
export { wss }; 