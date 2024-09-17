export interface ProcessedBlog {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
  } | null;
  tags: {
    id: string;
    name: string;
  }[];
}
