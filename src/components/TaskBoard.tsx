import { FC, useState, useEffect } from "react";
import {
  getColumns,
  addColumn,
  deleteColumn,
  getTodosByColumn,
  reorderTodos,
  moveTodoBetweenColumns,
} from "@/actions/action";
import Column from "./Column";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { columnType, todoType } from "@/drizzle/schema";
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";
import { Input } from "./ui/input";

const TaskBoard: FC = () => {
  const [columns, setColumns] = useState<
    (columnType & { todos: todoType[] })[]
  >([]);
  const [columnTitle, setColumnTitle] = useState("");

  const fetchColumns = async () => {
    const fetchedColumns = await getColumns();

    // Fetch todos for each column
    const columnsWithTodos = await Promise.all(
      fetchedColumns.map(async (column) => {
        const todos = await getTodosByColumn(column.id);
        return { ...column, todos };
      })
    );

    setColumns(columnsWithTodos);
  };

  useEffect(() => {
    fetchColumns();
  }, []);

  const handleAddColumn = async () => {
    if (!columnTitle.trim()) return;
    const newColumn = await addColumn(columnTitle);
    setColumns((prev) => [...prev, { ...newColumn[0], todos: [] }]);
    setColumnTitle("");
  };

  const handleDeleteColumn = async (columnId: number) => {
    await deleteColumn(columnId);
    setColumns((prev) => prev.filter((column) => column.id !== columnId));
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumnId = parseInt(source.droppableId);
    const destinationColumnId = parseInt(destination.droppableId);
    const todoId = parseInt(draggableId);

    // Optimistic UI Update
    const updatedColumns = [...columns];

    if (sourceColumnId === destinationColumnId) {
      // Reorder within the same column
      const column = updatedColumns.find((col) => col.id === sourceColumnId);
      if (column) {
        const [movedTodo] = column.todos.splice(source.index, 1);
        column.todos.splice(destination.index, 0, movedTodo);
      }
    } else {
      // Move between columns
      const sourceColumn = updatedColumns.find(
        (col) => col.id === sourceColumnId
      );
      const destinationColumn = updatedColumns.find(
        (col) => col.id === destinationColumnId
      );

      if (sourceColumn && destinationColumn) {
        const [movedTodo] = sourceColumn.todos.splice(source.index, 1);
        destinationColumn.todos.splice(destination.index, 0, movedTodo);
      }
    }

    setColumns(updatedColumns); // Update the state immediately

    try {
      // Perform async actions
      if (sourceColumnId === destinationColumnId) {
        await reorderTodos(
          sourceColumnId,
          todoId,
          source.index,
          destination.index
        );
      } else {
        await moveTodoBetweenColumns(
          todoId,
          sourceColumnId,
          destinationColumnId,
          source.index,
          destination.index
        );
      }

      // Refetch to ensure consistency
      await fetchColumns();
    } catch (error) {
      console.error("Drag and drop failed:", error);
      // Revert to consistent state in case of failure
      await fetchColumns();
    }
  };

  return (
    <div className="flex flex-col bg-gradient-to-r from-blue-100 via-green-50 to-purple-150 flex-grow ">
      <main className=" container mx-auto px-4 py-6 h-full">
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="flex-1 max-w-sm">
            <Input
              type="text"
              value={columnTitle}
              onChange={(e) => setColumnTitle(e.target.value)}
              placeholder="Create new column..."
              className="h-10"
            />
          </div>
          <Button onClick={handleAddColumn} className="h-10">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          {columns.length === 0 ? (
            <div className="h-full w-full flex justify-center items-center">
              <p className="text-gray-500">
                Manage and schedule your tasks with ease!
              </p>
            </div>
          ) : (
            <div className="flex mx-auto gap-6 overflow-x-auto w-full pb-4 h-full">
              {columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  todos={column.todos}
                  onDeleteColumn={() => handleDeleteColumn(column.id)}
                />
              ))}
            </div>
          )}
        </DragDropContext>
      </main>
    </div>
  );
};

export default TaskBoard;
