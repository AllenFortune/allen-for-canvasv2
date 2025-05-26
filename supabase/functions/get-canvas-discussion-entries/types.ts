
export interface DiscussionEntry {
  id: number;
  user_id: number;
  parent_id?: number | null;
  created_at: string;
  updated_at: string;
  rating_count?: number;
  rating_sum?: number;
  user_name?: string;
  message: string;
  user: UserInfo;
  read_state?: string;
  forced_read_state?: boolean;
  recent_replies?: DiscussionEntry[];
  replies?: DiscussionEntry[];
}

export interface UserInfo {
  id: number;
  name: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
  avatar_image_url?: string;
  sortable_name?: string;
  html_url?: string;
  pronouns?: string | null;
}

export interface ViewStructureItem {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  rating_count?: number;
  rating_sum?: number;
  user_name?: string;
  message: string;
  read_state?: string;
  forced_read_state?: boolean;
  replies?: ViewStructureItem[];
}

export interface ParticipantMap {
  [userId: number]: UserInfo;
}
