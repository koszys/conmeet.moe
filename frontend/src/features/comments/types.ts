export interface CommentAuthor {
  id: number;
  username: string;
  display_name: string;
  avatar_url?: string | null;
}

export interface CommentItemData {
  id: number;
  author: CommentAuthor | null;
  body: string;
  parent: number | null;
  reply_to_username?: string | null;
  is_deleted: boolean;
  is_author: boolean;
  can_delete: boolean;
  created_at: string;
  replies?: CommentItemData[];
}

export interface CommentSettings {
  unmount_all_comment_sections: boolean;
  unmount_all_meetup_comments: boolean;
  unmount_all_album_comments: boolean;
}

export interface CreateCommentInput {
  body: string;
  parent?: number | null;
}

export type CommentTargetType = 'meetup' | 'album';
