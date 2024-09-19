export interface Blog {
  id: string;
  title: string;
  content: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
  };
  tags: {
    id: string;
    name: string;
  }[];
}

export interface Session {
  user: {
    name?: string;
    email?: string;
    image?: string;
    id: string;
    role: "user" | "admin" | "superadmin";
    username: string;
  }
}
