"use server";
import db from "@/drizzle/db";
import { columns, todos } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// Columns Actions
export async function getColumns() {
  try {
    return await db.select().from(columns).orderBy(columns.order);
  } catch (error) {
    console.error("Error fetching columns:", error);
    return [];
  }
}

export async function addColumn(title: string) {
  try {
    // Calculate the next order value
    const maxOrderResult = await db
      .select({ maxOrder: sql<number>`max(${columns.order})` })
      .from(columns);

    const nextOrder = (maxOrderResult[0].maxOrder || 0) + 1;

    return await db
      .insert(columns)
      .values({
        title,
        order: nextOrder,
      })
      .returning();
  } catch (error) {
    console.error("Error adding column:", error);
    throw error;
  }
}

export async function deleteColumn(columnId: number) {
  try {
    // First, delete all todos in this column
    await db.delete(todos).where(eq(todos.columnId, columnId));

    // Then delete the column
    await db.delete(columns).where(eq(columns.id, columnId));

    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting column:", error);
    throw error;
  }
}

// Todos Actions
export async function getTodosByColumn(columnId: number) {
  try {
    return await db
      .select()
      .from(todos)
      .where(eq(todos.columnId, columnId))
      .orderBy(todos.order);
  } catch (error) {
    console.error("Error fetching todos for column:", error);
    return [];
  }
}

export async function addTodo(
  title: string,
  dueDate: Date | null,
  columnId: number
) {
  try {
    // Calculate the next order value for todos in this column
    const maxOrderResult = await db
      .select({ maxOrder: sql<number>`max(${todos.order})` })
      .from(todos)
      .where(eq(todos.columnId, columnId));

    const nextOrder = (maxOrderResult[0].maxOrder || 0) + 1;

    return await db
      .insert(todos)
      .values({
        title,
        dueDate: dueDate?.toISOString(),
        columnId,
        order: nextOrder,
      })
      .returning();
  } catch (error) {
    console.error("Error adding todo:", error);
    throw error;
  }
}

export async function deleteTodo(todoId: number) {
  try {
    await db.delete(todos).where(eq(todos.id, todoId));
    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting todo:", error);
    throw error;
  }
}

// Reordering Actions
export async function reorderTodos(
  columnId: number,
  todoId: number,
  sourceIndex: number,
  destinationIndex: number
) {
  try {
    // Fetch todos in the column to reorder
    const columnTodos = await db
      .select()
      .from(todos)
      .where(eq(todos.columnId, columnId))
      .orderBy(todos.order);

    // Remove the moved todo from its original position
    const [movedTodo] = columnTodos.splice(sourceIndex, 1);

    // Insert the todo at the new position
    columnTodos.splice(destinationIndex, 0, movedTodo);

    // Update orders for all todos in the column
    for (let i = 0; i < columnTodos.length; i++) {
      await db
        .update(todos)
        .set({ order: i })
        .where(eq(todos.id, columnTodos[i].id));
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Error reordering todos:", error);
    throw error;
  }
}

export async function moveTodoBetweenColumns(
  todoId: number,
  sourceColumnId: number,
  destinationColumnId: number,
  sourceIndex: number,
  destinationIndex: number
) {
  try {
    // Update the todo's column
    await db
      .update(todos)
      .set({ columnId: destinationColumnId })
      .where(eq(todos.id, todoId));

    // Fetch and reorder todos in source column
    const sourceTodos = await db
      .select()
      .from(todos)
      .where(eq(todos.columnId, sourceColumnId))
      .orderBy(todos.order);

    // Remove the moved todo from source column
    sourceTodos.splice(sourceIndex, 1);

    // Update orders for source column
    for (let i = 0; i < sourceTodos.length; i++) {
      await db
        .update(todos)
        .set({ order: i })
        .where(eq(todos.id, sourceTodos[i].id));
    }

    // Fetch and reorder todos in destination column
    const destTodos = await db
      .select()
      .from(todos)
      .where(eq(todos.columnId, destinationColumnId))
      .orderBy(todos.order);

    // Insert the moved todo at the new position
    destTodos.splice(destinationIndex, 0, { id: todoId } as any);

    // Update orders for destination column
    for (let i = 0; i < destTodos.length; i++) {
      await db
        .update(todos)
        .set({ order: i })
        .where(eq(todos.id, destTodos[i].id));
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Error moving todo between columns:", error);
    throw error;
  }
}

export const sendEmail = async () => {
  const user = await auth();
  try {
    await fetch("http://localhost:3000/api/send", {
      body: JSON.stringify({ email: user?.user?.email }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const getAllTodo = async () => {
  try {
    return await db.select().from(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return [];
  }
};
