import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByBoard = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();

    return tasks
      .filter((t) => t.userId === userId)
      .sort((a, b) => a.order - b.order);
  },
});

export const create = mutation({
  args: {
    columnId: v.id("columns"),
    boardId: v.id("boards"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const column = await ctx.db.get(args.columnId);
    if (!column || column.userId !== userId) throw new Error("Column not found");

    const existingTasks = await ctx.db
      .query("tasks")
      .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
      .collect();

    const maxOrder = existingTasks.reduce((max, t) => Math.max(max, t.order), -1);

    return await ctx.db.insert("tasks", {
      columnId: args.columnId,
      boardId: args.boardId,
      title: args.title,
      description: args.description,
      order: maxOrder + 1,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    const updates: { title?: string; description?: string } = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.id, updates);
  },
});

export const move = mutation({
  args: {
    id: v.id("tasks"),
    columnId: v.id("columns"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Task not found");

    const column = await ctx.db.get(args.columnId);
    if (!column || column.userId !== userId) throw new Error("Column not found");

    await ctx.db.patch(args.id, {
      columnId: args.columnId,
      order: args.order,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
