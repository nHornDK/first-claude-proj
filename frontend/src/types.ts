export interface Item {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string | null;
  displayName: string | null;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  color: string;
}

export interface PostComment {
  id: number;
  content: string;
  createdAt: string;
  author: string;
  isOwn: boolean;
}

export interface Post {
  id: number;
  content: string;
  imageData: string | null;
  createdAt: string;
  author: string;
  isOwn: boolean;
  comments: PostComment[];
}
