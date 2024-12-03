"use server";
import db from "@/drizzle/db";
import { columns, todos } from "@/drizzle/schema";
import { eq, max } from "drizzle-orm";

export const getColumns = async () => {
  return await db.select().from(columns);
};

export const getColumn = async (id: number) => {
  return await db.select().from(columns).where(eq(columns.id, id));
};

export const addColumn = async (title: string) => {
  return await db.insert(columns).values({ title }).returning();
};

export const deleteColumn = async (id: number) => {
  await db.delete(columns).where(eq(columns.id, id));
};

export const getTodos = async (columnId: number) => {
  return await db
    .select()
    .from(todos)
    .where(eq(todos.columnId, columnId))
    .orderBy(todos.order);
};

export const addTodo = async (
  title: string,
  dueDate: Date,
  columnId: number
) => {
  const maxOrderResult = await db
    .select({ maxOrder: max(todos.order) })
    .from(todos)
    .where(eq(todos.columnId, columnId));

  const currentMaxOrder = maxOrderResult[0]?.maxOrder ?? 0;
  return await db
    .insert(todos)
    .values({
      title,
      dueDate: dueDate.toISOString(),
      columnId,
      order: currentMaxOrder + 1,
    })
    .returning();
};

export const deleteTodo = async (id: number) => {
  await db.delete(todos).where(eq(todos.id, id));
};

export const moveTodoBetweenColumns = async (
  todoId: number,
  sourceColumnId: number,
  destColumnId: number,
  newOrder: number
) => {
  // Update todo's column and order
  await db
    .update(todos)
    .set({
      columnId: destColumnId,
      order: newOrder,
    })
    .where(eq(todos.id, todoId));

  // Fetch todos in destination column
  const destTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.columnId, destColumnId))
    .orderBy(todos.order);

  // Manually adjust orders for todos after insertion point
  for (let i = 0; i < destTodos.length; i++) {
    if (i >= newOrder && destTodos[i].id !== todoId) {
      await db
        .update(todos)
        .set({ order: i + 1 })
        .where(eq(todos.id, destTodos[i].id));
    }
  }
};

export const reorderTodos = async (
  columnId: number,
  todoId: number,
  newOrder: number
) => {
  // Fetch todos in the column
  const columnTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.columnId, columnId))
    .orderBy(todos.order);

  // Manually adjust orders
  for (let i = 0; i < columnTodos.length; i++) {
    const todo = columnTodos[i];

    if (todo.id === todoId) {
      // Move the specific todo to new order
      await db
        .update(todos)
        .set({ order: newOrder })
        .where(eq(todos.id, todoId));
    } else if (
      (i < newOrder && todo.order! <= newOrder) ||
      (i > newOrder && todo.order! >= newOrder)
    ) {
      // Shift orders for surrounding todos
      const newOrderValue = i < newOrder ? todo.order : todo.order! + 1;

      await db
        .update(todos)
        .set({ order: newOrderValue })
        .where(eq(todos.id, todo.id));
    }
  }
};
