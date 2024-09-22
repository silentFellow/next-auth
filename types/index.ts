export interface Response<T = undefined> {
  message: string;
  status: number;
  data?: T;
}

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


export interface Tag {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  password: string | null;
  role: string;
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
