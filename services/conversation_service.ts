import * as conversationRepo from "@/repositories/conversation_repo";
import * as messageRepo from "@/repositories/message_repo";
import * as userRepo from "@/repositories/user_repo";
import * as vendorRepo from "@/repositories/vendor_repo";
import * as notificationService from "./notification_service";
import { connectDB } from "@/lib/db";
import { startTransaction, commitTransaction, abortTransaction } from "@/lib/db_transaction";
import { Types } from "mongoose";

export interface CreateConversationData {
  participants: string[];
  subject?: string;
  type: ConversationType;
  relatedOrder?: string;
  relatedProduct?: string;
}

export interface SendMessageData {
  conversationId: string;
  content: string;
  messageType: MessageType;
  attachments?: string[];
  replyTo?: string;
}

export interface UpdateConversationData {
  subject?: string;
  status?: ConversationStatus;
  priority?: ConversationPriority;
  tags?: string[];
  assignedTo?: string;
}

export enum ConversationType {
  DIRECT = 'direct',
  ORDER_INQUIRY = 'order_inquiry',
  PRODUCT_INQUIRY = 'product_inquiry',
  SUPPORT = 'support',
  DISPUTE = 'dispute',
  VENDOR_SUPPORT = 'vendor_support'
}

export enum ConversationStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
  PENDING = 'pending'
}

export enum ConversationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
  ORDER_UPDATE = 'order_update'
}

export async function createConversation(userId: string, conversationData: CreateConversationData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate user
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Validate all participants exist
    const participants = [userId, ...conversationData.participants.filter(p => p !== userId)];
    for (const participantId of participants) {
      const participant = await userRepo.getUserById(participantId);
      if (!participant) {
        return { success: false, error: `Participant ${participantId} not found` };
      }
    }

    // Check if conversation already exists between these participants
    if (conversationData.type === ConversationType.DIRECT) {
      const existingConversation = await conversationRepo.getConversationByParticipants(participants);
      if (existingConversation) {
        return { success: true, data: existingConversation };
      }
    }

    // Determine priority
    const priority = determinePriority(conversationData.type);

    // Create conversation
    const conversation = await conversationRepo.createConversation({
      participants,
      subject: conversationData.subject || generateSubject(conversationData.type),
      type: conversationData.type,
      status: ConversationStatus.ACTIVE,
      priority,
      relatedOrder: conversationData.relatedOrder,
      relatedProduct: conversationData.relatedProduct,
      createdBy: userId,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }, session);

    // Send notifications to other participants
    const otherParticipants = participants.filter(p => p !== userId);
    for (const participantId of otherParticipants) {
      await notificationService.createNotification({
        user: participantId,
        title: 'New Conversation',
        message: `${user.firstName} ${user.lastName} started a conversation with you`,
        type: 'system',
        relatedId: conversation._id.toString(),
        relatedModel: 'Conversation'
      });
    }

    await commitTransaction(session);
    return { success: true, data: conversation };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error creating conversation:", error);
    return { success: false, error: "Failed to create conversation" };
  }
}

export async function sendMessage(userId: string, messageData: SendMessageData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate user
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Validate conversation
    const conversation = await conversationRepo.getConversationById(messageData.conversationId);
    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === userId
    );
    if (!isParticipant) {
      return { success: false, error: "Unauthorized to send message in this conversation" };
    }

    // Check if conversation is active
    if (conversation.status === ConversationStatus.CLOSED || 
        conversation.status === ConversationStatus.ARCHIVED) {
      return { success: false, error: "Cannot send message to closed or archived conversation" };
    }

    // Validate reply-to message if specified
    if (messageData.replyTo) {
      const replyToMessage = await messageRepo.getMessageById(messageData.replyTo);
      if (!replyToMessage || replyToMessage.conversation.toString() !== messageData.conversationId) {
        return { success: false, error: "Invalid reply-to message" };
      }
    }

    // Create message
    const message = await messageRepo.createConversationMessage({
      conversation: messageData.conversationId,
      sender: userId,
      content: messageData.content,
      messageType: messageData.messageType,
      attachments: messageData.attachments || [],
      replyTo: messageData.replyTo,
      readBy: [{ user: userId, readAt: new Date() }],
      createdAt: new Date(),
      updatedAt: new Date()
    }, session);

    // Update conversation
    await conversationRepo.updateConversationById(messageData.conversationId, {
      lastMessage: message._id,
      lastActivity: new Date(),
      messageCount: (conversation.messageCount || 0) + 1,
      updatedAt: new Date()
    }, session);

    // Send notifications to other participants
    const otherParticipants = conversation.participants.filter(
      (p: any) => p.toString() !== userId
    );
    
    for (const participantId of otherParticipants) {
      await notificationService.createNotification({
        user: participantId.toString(),
        title: 'New Message',
        message: `${user.firstName} ${user.lastName}: ${messageData.content.substring(0, 50)}${messageData.content.length > 50 ? '...' : ''}`,
        type: 'message',
        relatedId: messageData.conversationId,
        relatedModel: 'Conversation'
      });
    }

    await commitTransaction(session);
    return { success: true, data: message };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

export async function getConversationById(conversationId: string, userId: string) {
  try {
    await connectDB();
    
    const conversation = await conversationRepo.getConversationById(conversationId);
    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }

    // Check if user is a participant or admin
    const user = await userRepo.getUserById(userId);
    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === userId
    );
    const isAdmin = user?.role === 'admin';
    
    if (!isParticipant && !isAdmin) {
      return { success: false, error: "Unauthorized to view this conversation" };
    }

    return { success: true, data: conversation };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return { success: false, error: "Failed to fetch conversation" };
  }
}

export async function getUserConversations(userId: string, page: number = 1, limit: number = 20) {
  try {
    await connectDB();
    
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const conversations = await conversationRepo.getConversationsByUserId(userId, page, limit);
    return { success: true, data: conversations };
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    return { success: false, error: "Failed to fetch conversations" };
  }
}

export async function getConversationMessages(conversationId: string, userId: string, page: number = 1, limit: number = 50) {
  try {
    await connectDB();
    
    // Validate access to conversation
    const conversationResult = await getConversationById(conversationId, userId);
    if (!conversationResult.success) {
      return conversationResult;
    }

    const messages = await messageRepo.getMessagesByConversationId(conversationId, page, limit);
    return { success: true, data: messages };
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    return { success: false, error: "Failed to fetch messages" };
  }
}

export async function markMessagesAsRead(conversationId: string, userId: string, messageIds?: string[]) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate access to conversation
    const conversationResult = await getConversationById(conversationId, userId);
    if (!conversationResult.success) {
      return conversationResult;
    }

    // Mark messages as read
    const result = await messageRepo.markMessagesAsRead(conversationId, userId, messageIds, session);

    await commitTransaction(session);
    return { success: true, data: result };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error marking messages as read:", error);
    return { success: false, error: "Failed to mark messages as read" };
  }
}

export async function updateConversation(conversationId: string, userId: string, updateData: UpdateConversationData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const conversation = await conversationRepo.getConversationById(conversationId);
    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }

    // Check permissions
    const user = await userRepo.getUserById(userId);
    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === userId
    );
    const isAdmin = user?.role === 'admin';
    
    if (!isParticipant && !isAdmin) {
      return { success: false, error: "Unauthorized to update this conversation" };
    }

    // Only admins can change status, priority, and assignment
    if (!isAdmin && (updateData.status || updateData.priority || updateData.assignedTo)) {
      return { success: false, error: "Unauthorized to modify conversation status or priority" };
    }

    const updatedConversation = await conversationRepo.updateConversationById(conversationId, {
      ...updateData,
      updatedAt: new Date()
    }, session);

    await commitTransaction(session);
    return { success: true, data: updatedConversation };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error updating conversation:", error);
    return { success: false, error: "Failed to update conversation" };
  }
}

export async function closeConversation(conversationId: string, userId: string, reason?: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const conversation = await conversationRepo.getConversationById(conversationId);
    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }

    // Check permissions
    const user = await userRepo.getUserById(userId);
    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === userId
    );
    const isAdmin = user?.role === 'admin';
    
    if (!isParticipant && !isAdmin) {
      return { success: false, error: "Unauthorized to close this conversation" };
    }

    // Update conversation status
    const updatedConversation = await conversationRepo.updateConversationById(conversationId, {
      status: ConversationStatus.CLOSED,
      closedBy: userId,
      closedAt: new Date(),
      closureReason: reason,
      updatedAt: new Date()
    }, session);

    // Send system message
    await messageRepo.createMessage({
      conversation: conversationId,
      sender: userId,
      content: `Conversation closed${reason ? `: ${reason}` : ''}`,
      messageType: MessageType.SYSTEM,
      createdAt: new Date(),
      updatedAt: new Date()
    }, session);

    // Notify other participants
    const otherParticipants = conversation.participants.filter(
      (p: any) => p.toString() !== userId
    );
    
    for (const participantId of otherParticipants) {
      await notificationService.createNotification({
        user: participantId.toString(),
        title: 'Conversation Closed',
        message: `${user?.firstName} ${user?.lastName} closed the conversation`,
        type: 'message',
        relatedId: conversationId,
        relatedModel: 'Conversation'
      });
    }

    await commitTransaction(session);
    return { success: true, data: updatedConversation };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error closing conversation:", error);
    return { success: false, error: "Failed to close conversation" };
  }
}

export async function deleteMessage(messageId: string, userId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const message = await messageRepo.getMessageById(messageId);
    if (!message) {
      return { success: false, error: "Message not found" };
    }

    // Check permissions
    const user = await userRepo.getUserById(userId);
    const isOwner = message.sender.toString() === userId;
    const isAdmin = user?.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return { success: false, error: "Unauthorized to delete this message" };
    }

    // Soft delete the message
    await messageRepo.deleteMessageById(messageId, {
      isDeleted: true,
      deletedBy: userId,
      deletedAt: new Date(),
      updatedAt: new Date()
    }, session);

    await commitTransaction(session);
    return { success: true, message: "Message deleted successfully" };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error deleting message:", error);
    return { success: false, error: "Failed to delete message" };
  }
}

export async function searchConversations(userId: string, query: string, filters?: any, page: number = 1, limit: number = 20) {
  try {
    await connectDB();
    
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const conversations = await conversationRepo.getConversations(filters, { page, limit });
    return { success: true, data: conversations };
  } catch (error) {
    console.error("Error searching conversations:", error);
    return { success: false, error: "Failed to search conversations" };
  }
}

export async function getUnreadMessageCount(userId: string) {
  try {
    await connectDB();
    
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const count = await messageRepo.getUnreadMessageCount(userId);
    return { success: true, data: { unreadCount: count } };
  } catch (error) {
    console.error("Error getting unread message count:", error);
    return { success: false, error: "Failed to get unread message count" };
  }
}

export async function getConversationStats(adminId?: string, userId?: string) {
  try {
    await connectDB();
    
    // Validate admin access for global stats
    if (adminId) {
      const admin = await userRepo.getUserById(adminId);
      if (!admin || admin.role !== 'admin') {
        return { success: false, error: "Unauthorized - Admin access required" };
      }
    }

    let stats;
    if (userId) {
      stats = await conversationRepo.getConversationStatistics(userId);
    } else {
      stats = await conversationRepo.getConversationStatistics();
    }

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching conversation stats:", error);
    return { success: false, error: "Failed to fetch conversation statistics" };
  }
}

// Helper functions
function determinePriority(type: ConversationType): ConversationPriority {
  switch (type) {
    case ConversationType.DISPUTE:
      return ConversationPriority.HIGH;
    case ConversationType.SUPPORT:
    case ConversationType.VENDOR_SUPPORT:
      return ConversationPriority.MEDIUM;
    case ConversationType.ORDER_INQUIRY:
      return ConversationPriority.MEDIUM;
    default:
      return ConversationPriority.LOW;
  }
}

function generateSubject(type: ConversationType): string {
  switch (type) {
    case ConversationType.ORDER_INQUIRY:
      return 'Order Inquiry';
    case ConversationType.PRODUCT_INQUIRY:
      return 'Product Inquiry';
    case ConversationType.SUPPORT:
      return 'Support Request';
    case ConversationType.DISPUTE:
      return 'Dispute Discussion';
    case ConversationType.VENDOR_SUPPORT:
      return 'Vendor Support';
    default:
      return 'Conversation';
  }
}