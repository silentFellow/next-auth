import { z } from "zod";

export const tagValidation = z.object({
  name: z.string().min(3, "mininmum 3 character long").max(30, "maximum 30 character long")
})

export const blogValidation = z.object({
  author: z.string().min(3, "mininmum 3 character long"),
  tags: z.array(z.string()).min(1, "atleast one tag is required"),
  title: z.string().min(3, "mininmum 3 character long").max(99, "maximum 99 character long"),
  thumbnail: z.string().min(1, "thumbnail is required"),
  content: z.string()
})
