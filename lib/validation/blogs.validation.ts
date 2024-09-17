import { z } from "zod";

export const tagValidation = z.object({
  name: z.string().min(3, "mininmum 3 character long").max(12, "maximum 12 character long")
})

export const blogValidation = z.object({
  author: z.string().min(3, "mininmum 3 character long"),
  tags: z.array(z.string()).min(1, "atleast one tag is required"),
  title: z.string().min(3, "mininmum 3 character long").max(30, "maximum 20 character long"),
  content: z.string()
})
