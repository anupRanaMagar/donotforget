import { useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";

interface Task {
  id: string;
  content: string;
  dueDate: string;
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface BoardData {
  columns: { [key: string]: Column };
  tasks: { [key: string]: Task };
  columnOrder: string[];
}

const TaskCard = () => {
  const initialData: BoardData = {
    columns: {
      "column-1": {
        id: "column-1",
        title: "age",
        taskIds: ["task-1", "task-2", "task-3", "task-4"],
      },
      "column-2": {
        id: "column-2",
        title: "anup",
        taskIds: ["task-5"],
      },
      "column-3": {
        id: "column-3",
        title: "afe",
        taskIds: ["task-6"],
      },
      "column-4": {
        id: "column-4",
        title: "ashok",
        taskIds: ["task-7"],
      },
    },
    tasks: {
      "task-1": { id: "task-1", content: "adf", dueDate: "No due date" },
      "task-2": { id: "task-2", content: "brgr", dueDate: "11/11/2024" },
      "task-3": { id: "task-3", content: "shrr", dueDate: "11/11/2024" },
      "task-4": { id: "task-4", content: "shrr", dueDate: "11/11/2024" },
      "task-5": { id: "task-5", content: "adf", dueDate: "11/20/2024" },
      "task-6": { id: "task-6", content: "anasdf", dueDate: "11/9/2024" },
      "task-7": { id: "task-7", content: "vr", dueDate: "11/9/2024" },
    },
    columnOrder: ["column-1", "column-2", "column-3", "column-4"],
  };

  const [data, setData] = useState<BoardData>(initialData);
  const [newColumnTitle, setNewColumnTitle] = useState<string>("");
  const [newTaskContent, setNewTaskContent] = useState<string>("");
  const [newTaskDate, setNewTaskDate] = useState<string>("");
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      setData((prevData) => ({
        ...prevData,
        columns: {
          ...prevData.columns,
          [newColumn.id]: newColumn,
        },
      }));
      return;
    }

    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };

    setData((prevData) => ({
      ...prevData,
      columns: {
        ...prevData.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    }));
  };

  const addColumn = () => {
    if (!newColumnTitle.trim()) return;

    const newColumnId = `column-${Object.keys(data.columns).length + 1}`;

    setData((prevData) => ({
      ...prevData,
      columns: {
        ...prevData.columns,
        [newColumnId]: {
          id: newColumnId,
          title: newColumnTitle,
          taskIds: [],
        },
      },
      columnOrder: [...prevData.columnOrder, newColumnId],
    }));

    setNewColumnTitle("");
  };

  const addTask = (columnId: string) => {
    if (!newTaskContent.trim()) return;

    const newTaskId = `task-${Object.keys(data.tasks).length + 1}`;

    setData((prevData) => ({
      ...prevData,
      tasks: {
        ...prevData.tasks,
        [newTaskId]: {
          id: newTaskId,
          content: newTaskContent,
          dueDate: newTaskDate || "No due date",
        },
      },
      columns: {
        ...prevData.columns,
        [columnId]: {
          ...prevData.columns[columnId],
          taskIds: [...prevData.columns[columnId].taskIds, newTaskId],
        },
      },
    }));

    setNewTaskContent("");
    setNewTaskDate("");
    setSelectedColumn(null);
  };

  const deleteTask = (columnId: string, taskId: string) => {
    setData((prevData) => {
      const newColumns = { ...prevData.columns };
      newColumns[columnId] = {
        ...newColumns[columnId],
        taskIds: newColumns[columnId].taskIds.filter((id) => id !== taskId),
      };

      const newTasks = { ...prevData.tasks };
      delete newTasks[taskId];

      return {
        ...prevData,
        columns: newColumns,
        tasks: newTasks,
      };
    });
  };

  const deleteColumn = (columnId: string) => {
    setData((prevData) => {
      const newColumns = { ...prevData.columns };
      const newTasks = { ...prevData.tasks };

      // Remove tasks associated with the column
      newColumns[columnId].taskIds.forEach((taskId) => {
        delete newTasks[taskId];
      });

      delete newColumns[columnId];

      return {
        ...prevData,
        columns: newColumns,
        tasks: newTasks,
        columnOrder: prevData.columnOrder.filter((id) => id !== columnId),
      };
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow p-4">
        <div className="container mx-auto">
          <h1 className="text-lg">NavBar</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        <h2 className="text-2xl font-bold text-center mb-4">Task Board</h2>

        <div className="flex justify-center mb-4">
          <input
            type="text"
            placeholder="New Column"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            className="border rounded p-2 mr-2"
          />
          <button
            onClick={addColumn}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Column
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {data.columnOrder.map((columnId) => {
              const column = data.columns[columnId];
              const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

              return (
                <div
                  key={column.id}
                  className="bg-white rounded shadow p-4 w-64 flex-shrink-0"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">{column.title}</h3>
                    <button
                      onClick={() => deleteColumn(column.id)}
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  </div>

                  <Droppable droppableId={column.id} direction="vertical">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4 min-h-[100px]"
                      >
                        {tasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-gray-100 p-2 rounded flex justify-between items-center"
                              >
                                <div>
                                  <p>{task.content}</p>
                                  <p className="text-sm text-gray-500">
                                    Due Date: {task.dueDate}
                                  </p>
                                </div>
                                <button
                                  onClick={() => deleteTask(column.id, task.id)}
                                  className="text-red-500"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {selectedColumn === column.id ? (
                    <div className="mt-4 space-y-2">
                      <input
                        type="text"
                        placeholder="Task content"
                        value={newTaskContent}
                        onChange={(e) => setNewTaskContent(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="date"
                        value={newTaskDate}
                        onChange={(e) => setNewTaskDate(e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addTask(column.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded w-full"
                        >
                          Save Task
                        </button>
                        <button
                          onClick={() => setSelectedColumn(null)}
                          className="bg-gray-300 text-black px-4 py-2 rounded w-full"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedColumn(column.id)}
                      className="bg-black text-white w-full py-2 mt-4 rounded flex justify-center items-center"
                    >
                      Add Todo +
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </main>

      <footer className="bg-white shadow p-4">
        <div className="container mx-auto">
          <p>Footer</p>
        </div>
      </footer>
    </div>
  );
};

export default TaskCard;
