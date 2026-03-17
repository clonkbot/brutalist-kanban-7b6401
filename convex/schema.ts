import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  boards: defineTable({
    name: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  columns: defineTable({
    boardId: v.id("boards"),
    name: v.string(),
    order: v.number(),
    userId: v.id("users"),
  })
    .index("by_board", ["boardId"])
    .index("by_user", ["userId"]),
  tasks: defineTable({
    columnId: v.id("columns"),
    boardId: v.id("boards"),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_column", ["columnId"])
    .index("by_board", ["boardId"])
    .index("by_user", ["userId"]),
});
