import { FC, useState, useEffect } from "react";
import {
  getColumns,
  addColumn,
  deleteColumn,
  reorderTodos,
  moveTodoBetweenColumns,
} from "@/actions/action";
import Column from "./Column";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { columnType, todoType } from "@/drizzle/schema";
import { todo } from "node:test";

const TaskBoard: FC = () => {
  const [columns, setColumns] = useState<columnType[]>([]);
  const [columnTitle, setColumnTitle] = useState("");

  const fetchColumns = async () => {
    const fetchedColumns = await getColumns();

    setColumns(fetchedColumns);
  };

  useEffect(() => {
    fetchColumns();
  }, []);

  const handleAddColumn = async () => {
    if (!columnTitle.trim()) return;
    const newColumn = await addColumn(columnTitle);
    setColumns((prev) => [...prev, newColumn[0]]);
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
    const todoId = parseInt(draggableId.split("-")[1]);

    try {
      // Optimistic UI update
      const updatedColumns = columns.map((column) => {
        // if (column.id === sourceColumnId || column.id === destinationColumnId) {
        // return { ...column };

        return column;
      });

      setColumns(updatedColumns);

      // Perform server-side action
      if (sourceColumnId === destinationColumnId) {
        await reorderTodos(
          Number(source.droppableId),
          Number(draggableId),
          destination.index
        );
      } else {
        await moveTodoBetweenColumns(
          Number(draggableId),
          Number(source.droppableId),
          Number(destination.droppableId),
          destination.index
        );
      }
      await fetchColumns();
    } catch (error) {
      console.error("Drag and drop failed:", error);
      // Optionally, revert the optimistic update
      await fetchColumns();
    }
  };

  return (
    <div className="flex flex-col items-center p-4 flex-grow">
      <h1 className="text-2xl font-bold mb-4">Task Board</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={columnTitle}
          onChange={(e) => setColumnTitle(e.target.value)}
          placeholder="New Column"
          className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddColumn}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Add Column
        </button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto w-full max-w-[95%] pb-4">
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0  bg-gray-100 p-4 rounded-lg shadow-md min-w-64 md:min-w-80"
            >
              <Column
                column={column}
                onDeleteColumn={() => handleDeleteColumn(column.id)}
              />
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskBoard;
