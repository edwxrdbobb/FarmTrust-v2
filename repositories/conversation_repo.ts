//@ts-check
import Conversation from "@/models/conversation_model";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

/**
 * Creates a new conversation
 * @param {Object} data - The data for the conversation
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<Conversation>} The created conversation
 */
export async function createConversation(data: any, options: any = {}) {
  const conversation = new Conversation(data);
  return await conversation.save(options);
}

/**
 * Gets a conversation by its id
 * @param {string} id - The id of the conversation
 * @returns {Promise<Conversation>} The conversation with populated participants
 */
export async function getConversationById(id: string) {
  return await Conversation.findById(id)
    .populate("participants", "name email role");
}

/**
 * Gets conversations by participant id
 * @param {string} participantId - The participant id
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Conversation[]>} Array of conversations for the participant
 */
export async function getConversationsByParticipantId(participantId: string, options: QueryOptions = {}) {
  let query = Conversation.find({ participants: participantId })
    .populate("participants", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets conversation between two participants
 * @param {string} participant1Id - The first participant id
 * @param {string} participant2Id - The second participant id
 * @returns {Promise<Conversation>} The conversation between the participants
 */
export async function getConversationBetweenParticipants(participant1Id: string, participant2Id: string) {
  return await Conversation.findOne({
    participants: { $all: [participant1Id, participant2Id] },
    $expr: { $eq: [{ $size: "$participants" }, 2] }
  }).populate("participants", "name email role");
}

/**
 * Gets conversations by type
 * @param {string} type - The conversation type
 * @param {Object} [options] - Query options
 * @returns {Promise<Conversation[]>} Array of conversations with the specified type
 */
export async function getConversationsByType(type: string, options: QueryOptions = {}) {
  let query = Conversation.find({ type })
    .populate("participants", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets all conversations with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Conversation[]>} Array of conversations with populated data
 */
export async function getConversations(filter: any = {}, options: QueryOptions = {}) {
  let query = Conversation.find(filter)
    .populate("participants", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets recent conversations for a participant
 * @param {string} participantId - The participant id
 * @param {number} [limit=20] - Number of recent conversations to fetch
 * @returns {Promise<Conversation[]>} Array of recent conversations
 */
export async function getRecentConversations(participantId: string, limit: number = 20) {
  return await getConversationsByParticipantId(participantId, {
    sort: { lastMessageAt: -1 },
    limit
  });
}

/**
 * Updates a conversation
 * @param {string} id - The id of the conversation
 * @param {Object} data - The data to update the conversation with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<Conversation>} The updated conversation
 */
export async function updateConversation(id: string, data: any, options: any = {}) {
  return await Conversation.findByIdAndUpdate(id, data, { new: true, ...options })
    .populate("participants", "name email role");
}

/**
 * Updates conversation's last message info
 * @param {string} id - The id of the conversation
 * @param {string} lastMessage - The last message content
 * @param {Date} [lastMessageAt] - The timestamp of the last message
 * @returns {Promise<Conversation>} The updated conversation
 */
export async function updateConversationLastMessage(id: string, lastMessage: string, lastMessageAt: Date = new Date()) {
  return await updateConversation(id, {
    lastMessage,
    lastMessageAt,
    updatedAt: new Date()
  });
}

/**
 * Adds participant to conversation
 * @param {string} id - The id of the conversation
 * @param {string} participantId - The participant id to add
 * @returns {Promise<Conversation>} The updated conversation
 */
export async function addParticipantToConversation(id: string, participantId: string) {
  return await Conversation.findByIdAndUpdate(
    id,
    { $addToSet: { participants: participantId } },
    { new: true }
  ).populate("participants", "name email role");
}

/**
 * Removes participant from conversation
 * @param {string} id - The id of the conversation
 * @param {string} participantId - The participant id to remove
 * @returns {Promise<Conversation>} The updated conversation
 */
export async function removeParticipantFromConversation(id: string, participantId: string) {
  return await Conversation.findByIdAndUpdate(
    id,
    { $pull: { participants: participantId } },
    { new: true }
  ).populate("participants", "name email role");
}

/**
 * Deletes a conversation by its id
 * @param {string} id - The id of the conversation
 * @returns {Promise<Conversation>} The deleted conversation
 */
export async function deleteConversation(id: string) {
  return await Conversation.findByIdAndDelete(id);
}

/**
 * Counts total conversations
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<number>} The count of conversations
 */
export async function countConversations(filter: any = {}) {
  return await Conversation.countDocuments(filter);
}

/**
 * Counts conversations for a participant
 * @param {string} participantId - The participant id
 * @returns {Promise<number>} The count of conversations
 */
export async function countConversationsByParticipant(participantId: string) {
  return await Conversation.countDocuments({ participants: participantId });
}

/**
 * Finds or creates conversation between participants
 * @param {string[]} participantIds - Array of participant ids
 * @param {string} type - The conversation type
 * @returns {Promise<Conversation>} The conversation
 */
export async function findOrCreateConversation(participantIds: string[], type: string) {
  // Try to find existing conversation
  let conversation = await Conversation.findOne({
    participants: { $all: participantIds },
    $expr: { $eq: [{ $size: "$participants" }, participantIds.length] }
  }).populate("participants", "name email role");
  
  // Create new conversation if not found
  if (!conversation) {
    conversation = await createConversation({
      participants: participantIds,
      type
    });
    
    // Populate the newly created conversation
    conversation = await getConversationById(conversation._id);
  }
  
  return conversation;
}