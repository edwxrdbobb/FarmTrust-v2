//@ts-check
import Message from "@/models/message_model";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

/**
 * Creates a new message
 * @param {Object} data - The data for the message
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<Message>} The created message
 */
export async function createMessage(data: any, options: any = {}) {
  const message = new Message(data);
  return await message.save(options);
}

/**
 * Gets a message by its id
 * @param {string} id - The id of the message
 * @returns {Promise<Message>} The message with populated data
 */
export async function getMessageById(id: string) {
  return await Message.findById(id)
    .populate("sender", "name email role")
    .populate("conversation");
}

/**
 * Gets messages by conversation id
 * @param {string} conversationId - The conversation id
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Message[]>} Array of messages for the conversation
 */
export async function getMessagesByConversationId(conversationId: string, options: QueryOptions = {}) {
  let query = Message.find({ conversation: conversationId })
    .populate("sender", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets messages by sender id
 * @param {string} senderId - The sender id
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Message[]>} Array of messages from the sender
 */
export async function getMessagesBySenderId(senderId: string, options: QueryOptions = {}) {
  let query = Message.find({ sender: senderId })
    .populate("sender", "name email role")
    .populate("conversation");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets messages by type
 * @param {string} type - The message type
 * @param {Object} [options] - Query options
 * @returns {Promise<Message[]>} Array of messages with the specified type
 */
export async function getMessagesByType(type: string, options: QueryOptions = {}) {
  let query = Message.find({ type })
    .populate("sender", "name email role")
    .populate("conversation");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets unread messages for a user
 * @param {string} userId - The user id
 * @param {Object} [options] - Query options
 * @returns {Promise<Message[]>} Array of unread messages
 */
export async function getUnreadMessages(userId: string, options: QueryOptions = {}) {
  let query = Message.find({
    readBy: { $not: { $elemMatch: { user: userId } } }
  })
    .populate("sender", "name email role")
    .populate("conversation");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets unread messages count for a user
 * @param {string} userId - The user id
 * @returns {Promise<number>} Count of unread messages
 */
export async function getUnreadMessagesCount(userId: string) {
  return await Message.countDocuments({
    readBy: { $not: { $elemMatch: { user: userId } } }
  });
}

/**
 * Gets unread messages for a conversation
 * @param {string} conversationId - The conversation id
 * @param {string} userId - The user id
 * @returns {Promise<Message[]>} Array of unread messages in the conversation
 */
export async function getUnreadMessagesInConversation(conversationId: string, userId: string) {
  return await Message.find({
    conversation: conversationId,
    readBy: { $not: { $elemMatch: { user: userId } } }
  })
    .populate("sender", "name email role");
}

/**
 * Gets all messages with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Message[]>} Array of messages with populated data
 */
export async function getMessages(filter: any = {}, options: QueryOptions = {}) {
  let query = Message.find(filter)
    .populate("sender", "name email role")
    .populate("conversation");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets recent messages for a conversation
 * @param {string} conversationId - The conversation id
 * @param {number} [limit=50] - Number of recent messages to fetch
 * @returns {Promise<Message[]>} Array of recent messages
 */
export async function getRecentMessages(conversationId: string, limit: number = 50) {
  return await getMessagesByConversationId(conversationId, {
    sort: { createdAt: -1 },
    limit
  });
}

/**
 * Updates a message
 * @param {string} id - The id of the message
 * @param {Object} data - The data to update the message with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<Message>} The updated message
 */
export async function updateMessage(id: string, data: any, options: any = {}) {
  return await Message.findByIdAndUpdate(id, data, { new: true, ...options })
    .populate("sender", "name email role")
    .populate("conversation");
}

/**
 * Marks a message as read by a user
 * @param {string} messageId - The message id
 * @param {string} userId - The user id
 * @returns {Promise<Message>} The updated message
 */
export async function markMessageAsRead(messageId: string, userId: string) {
  return await Message.findByIdAndUpdate(
    messageId,
    {
      $addToSet: {
        readBy: {
          user: userId,
          readAt: new Date()
        }
      }
    },
    { new: true }
  )
    .populate("sender", "name email role")
    .populate("conversation");
}

/**
 * Marks multiple messages as read by a user
 * @param {string[]} messageIds - Array of message ids
 * @param {string} userId - The user id
 * @returns {Promise<Object>} Update result
 */
export async function markMessagesAsRead(messageIds: string[], userId: string) {
  return await Message.updateMany(
    { _id: { $in: messageIds } },
    {
      $addToSet: {
        readBy: {
          user: userId,
          readAt: new Date()
        }
      }
    }
  );
}

/**
 * Marks all messages in a conversation as read by a user
 * @param {string} conversationId - The conversation id
 * @param {string} userId - The user id
 * @returns {Promise<Object>} Update result
 */
export async function markConversationMessagesAsRead(conversationId: string, userId: string) {
  return await Message.updateMany(
    {
      conversation: conversationId,
      readBy: { $not: { $elemMatch: { user: userId } } }
    },
    {
      $addToSet: {
        readBy: {
          user: userId,
          readAt: new Date()
        }
      }
    }
  );
}

/**
 * Updates message content
 * @param {string} id - The id of the message
 * @param {string} content - The new content
 * @returns {Promise<Message>} The updated message
 */
export async function updateMessageContent(id: string, content: string) {
  return await updateMessage(id, {
    content,
    isEdited: true,
    editedAt: new Date()
  });
}

/**
 * Deletes a message by its id
 * @param {string} id - The id of the message
 * @returns {Promise<Message>} The deleted message
 */
export async function deleteMessage(id: string) {
  return await Message.findByIdAndDelete(id);
}

/**
 * Soft deletes a message (marks as deleted)
 * @param {string} id - The id of the message
 * @returns {Promise<Message>} The updated message
 */
export async function softDeleteMessage(id: string) {
  return await updateMessage(id, {
    isDeleted: true,
    deletedAt: new Date()
  });
}

/**
 * Counts total messages
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<number>} The count of messages
 */
export async function countMessages(filter: any = {}) {
  return await Message.countDocuments(filter);
}

/**
 * Counts messages in a conversation
 * @param {string} conversationId - The conversation id
 * @returns {Promise<number>} The count of messages
 */
export async function countMessagesInConversation(conversationId: string) {
  return await Message.countDocuments({ conversation: conversationId });
}

/**
 * Counts messages by sender
 * @param {string} senderId - The sender id
 * @returns {Promise<number>} The count of messages
 */
export async function countMessagesBySender(senderId: string) {
  return await Message.countDocuments({ sender: senderId });
}

/**
 * Search messages by content
 * @param {string} searchTerm - The search term
 * @param {Object} [options] - Query options
 * @returns {Promise<Message[]>} Array of matching messages
 */
export async function searchMessages(searchTerm: string, options: QueryOptions = {}) {
  let query = Message.find({
    content: { $regex: searchTerm, $options: 'i' },
    isDeleted: { $ne: true }
  })
    .populate("sender", "name email role")
    .populate("conversation");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets message statistics
 * @param {Object} [filter] - Additional filter criteria
 * @returns {Promise<Object>} Message statistics
 */
export async function getMessageStats(filter: any = {}) {
  const stats = await Message.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        totalTextMessages: {
          $sum: { $cond: [{ $eq: ["$type", "text"] }, 1, 0] }
        },
        totalImageMessages: {
          $sum: { $cond: [{ $eq: ["$type", "image"] }, 1, 0] }
        },
        totalFileMessages: {
          $sum: { $cond: [{ $eq: ["$type", "file"] }, 1, 0] }
        },
        totalEditedMessages: {
          $sum: { $cond: ["$isEdited", 1, 0] }
        },
        totalDeletedMessages: {
          $sum: { $cond: ["$isDeleted", 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalMessages: 0,
    totalTextMessages: 0,
    totalImageMessages: 0,
    totalFileMessages: 0,
    totalEditedMessages: 0,
    totalDeletedMessages: 0
  };
}