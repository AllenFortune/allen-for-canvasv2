
import type { DiscussionEntry, UserInfo, ViewStructureItem, ParticipantMap } from './types.ts';

export function createParticipantMap(participants: any[]): ParticipantMap {
  const participantMap: ParticipantMap = {};
  
  if (participants) {
    console.log(`Found ${participants.length} participants`);
    participants.forEach(participant => {
      participantMap[participant.id] = {
        id: participant.id,
        name: participant.display_name || participant.name || `User ${participant.id}`,
        display_name: participant.display_name,
        email: participant.email,
        avatar_url: participant.avatar_image_url,
        avatar_image_url: participant.avatar_image_url,
        sortable_name: participant.sortable_name,
        html_url: participant.html_url,
        pronouns: participant.pronouns
      };
    });
  }
  
  return participantMap;
}

export function extractEntriesFromView(viewStructure: ViewStructureItem[], participantMap: ParticipantMap = {}): DiscussionEntry[] {
  const allEntries: DiscussionEntry[] = [];
  
  function processViewItem(item: ViewStructureItem, parentId: number | null = null) {
    if (item.id && item.user_id) {
      const userInfo = participantMap[item.user_id] || {
        id: item.user_id,
        name: item.user_name || `User ${item.user_id}`,
        display_name: item.user_name
      };
      
      const entry: DiscussionEntry = {
        id: item.id,
        user_id: item.user_id,
        parent_id: parentId,
        created_at: item.created_at,
        updated_at: item.updated_at,
        rating_count: item.rating_count,
        rating_sum: item.rating_sum,
        user_name: userInfo.name,
        message: item.message,
        user: userInfo,
        read_state: item.read_state,
        forced_read_state: item.forced_read_state
      };
      
      allEntries.push(entry);
      
      if (item.replies && Array.isArray(item.replies)) {
        item.replies.forEach((reply: ViewStructureItem) => {
          processViewItem(reply, item.id);
        });
      }
    }
  }
  
  viewStructure.forEach(item => {
    processViewItem(item);
  });
  
  return allEntries;
}

export function flattenDiscussionEntries(entries: any[], participantMap: ParticipantMap = {}): DiscussionEntry[] {
  const allEntries: DiscussionEntry[] = [];
  
  function processEntry(entry: any, parentId: number | null = null) {
    const userInfo = participantMap[entry.user_id] || {
      id: entry.user_id,
      name: entry.user?.display_name || entry.user_name || `User ${entry.user_id}`,
      display_name: entry.user?.display_name || entry.user_name,
      email: entry.user?.email,
      avatar_url: entry.user?.avatar_image_url || entry.user?.avatar_url,
      avatar_image_url: entry.user?.avatar_image_url,
      sortable_name: entry.user?.sortable_name,
      html_url: entry.user?.html_url,
      pronouns: entry.user?.pronouns
    };
    
    const normalizedEntry: DiscussionEntry = {
      ...entry,
      parent_id: parentId,
      user_name: userInfo.name,
      user: userInfo
    };
    
    allEntries.push(normalizedEntry);
    
    if (entry.recent_replies && Array.isArray(entry.recent_replies)) {
      entry.recent_replies.forEach((reply: any) => {
        processEntry(reply, entry.id);
      });
    }
    
    if (entry.replies && Array.isArray(entry.replies)) {
      entry.replies.forEach((reply: any) => {
        processEntry(reply, entry.id);
      });
    }
  }
  
  entries.forEach(entry => {
    processEntry(entry);
  });
  
  return allEntries;
}
