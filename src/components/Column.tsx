import { FC, useState, useEffect } from "react";
import { getTodos, addTodo, deleteTodo } from "@/actions/action";
import { columnType, todoType } from "@/drizzle/schema";
import { Plus, PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Draggable, Droppable } from "react-beautiful-dnd";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Column: FC<{
  column: columnType;
  onDeleteColumn: () => void;
}> = ({ column, onDeleteColumn }) => {
  const [open, setOpen] = useState(false);
  const [todos, setTodos] = useState<todoType[]>([]);
  const [todoTitle, setTodoTitle] = useState("");
  const [date, setDate] = useState<Date>(new Date());

  const fetchTodos = async () => {
    const fetchedTodos = await getTodos(column.id);
    setTodos(fetchedTodos);
  };

  useEffect(() => {
    fetchTodos();
  }, [column]);

  const handleAddTodo = async () => {
    if (!todoTitle.trim()) return;
    const newTodo = await addTodo(todoTitle, date, column.id);
    setTodos((prev) => [...prev, newTodo[0]]);
    setTodoTitle("");
    setOpen(false);
  };

  const handleDeleteTodo = async (todoId: number) => {
    await deleteTodo(todoId);
    setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
  };

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{column.title}</h3>
        <button
          onClick={onDeleteColumn}
          className="text-red-500 hover:text-red-700"
        >
          ✕
        </button>
      </div>

      <Droppable droppableId={column.id.toString()} direction="vertical">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col p-2 rounded-md transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-blue-50" : "bg-gray-50"
            }`}
            style={{
              minHeight: "300px",
            }}
          >
            {todos.map((todo, index) => (
              <Draggable
                key={`todo-${todo.id}`}
                draggableId={todo.id.toString()}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-2 p-2 bg-white rounded-md shadow-sm transition-all duration-200 ${
                      snapshot.isDragging
                        ? "shadow-lg ring-2 ring-blue-200 z-50"
                        : "hover:shadow"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span>{todo.title}</span>
                        <span className="text-sm text-gray-600">
                          Due:{" "}
                          {todo.dueDate
                            ? new Date(todo.dueDate).toLocaleDateString()
                            : "No due date"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full mt-2">
            Add Todo <PlusIcon className="ml-2 h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="flex-1 gap-2 flex flex-col">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddTodo();
                }}
              >
                <Label htmlFor="task">Task</Label>
                <Input
                  id="task"
                  placeholder="Go for a run"
                  value={todoTitle}
                  onChange={(e) => setTodoTitle(e.target.value)}
                  type="text"
                />
                <Label htmlFor="date" className="mt-4">
                  Due Date
                </Label>
                <div className="border-2 rounded-md w-fit p-1 mt-2">
                  <input
                    onChange={(e) => setDate(new Date(e.target.value))}
                    id="date"
                    aria-label="Date"
                    type="date"
                  />
                </div>
              </form>
            </div>
          </div>
          <DialogFooter className="flex flex-row w-fit">
            <Button
              type="button"
              size="sm"
              className="px-3"
              onClick={handleAddTodo}
            >
              Add <Plus className="ml-2 h-4 w-4" />
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Column;
