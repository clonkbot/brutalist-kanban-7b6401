import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("boards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const board = await ctx.db.get(args.id);
    if (!board || board.userId !== userId) return null;
    return board;
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const boardId = await ctx.db.insert("boards", {
      name: args.name,
      userId,
      createdAt: Date.now(),
    });

    // Create default columns
    const defaultColumns = ["BACKLOG", "IN PROGRESS", "DONE"];
    for (let i = 0; i < defaultColumns.length; i++) {
      await ctx.db.insert("columns", {
        boardId,
        name: defaultColumns[i],
        order: i,
        userId,
      });
    }

    return boardId;
  },
});

export const remove = mutation({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const board = await ctx.db.get(args.id);
    if (!board || board.userId !== userId) throw new Error("Not found");

    // Delete all tasks in this board
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_board", (q) => q.eq("boardId", args.id))
      .collect();
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    // Delete all columns in this board
    const columns = await ctx.db
      .query("columns")
      .withIndex("by_board", (q) => q.eq("boardId", args.id))
      .collect();
    for (const column of columns) {
      await ctx.db.delete(column._id);
    }

    await ctx.db.delete(args.id);
  },
});
