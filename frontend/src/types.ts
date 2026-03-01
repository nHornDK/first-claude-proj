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
