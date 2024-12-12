import { FC, useState } from "react";
import { addTodo, deleteTodo } from "@/actions/action";
import { columnType, todoType } from "@/drizzle/schema";
import { Calendar, Grip, Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import { Draggable, Droppable } from "react-beautiful-dnd";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const Column: FC<{
  column: columnType;
  todos: todoType[];
  onDeleteColumn: () => void;
}> = ({ column, todos, onDeleteColumn }) => {
  const [open, setOpen] = useState(false);
  const [todoTitle, setTodoTitle] = useState("");
  const [todoList, setTodoList] = useState<todoType[]>(todos);
  const [date, setDate] = useState<Date | null>(null);

  const { toast } = useToast();

  // const [optimisticState, addOptimistic] = useOptimistic(state,updateFn);

  const handleAddTodo = async () => {
    if (!todoTitle.trim()) return;

    // Pass the column ID when adding a todo
    try {
      const newTodo = await addTodo(todoTitle, date, column.id);
      if (newTodo) {
        setTodoList((prev) => [...prev, newTodo[0]]);
      }
      setOpen(false);
      toast({
        variant: "default",
        title: "Task added",
        description: "The task has been added successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error adding task",
        description:
          "An error occurred while adding the task. Please try again.",
      });
    }

    // The new todo logic will depend on your specific action implementation
  };

  const handleDeleteTodo = async (todoId: number) => {
    try {
      setTodoList((prev) => prev.filter((todo) => todo.id !== todoId));
      await deleteTodo(todoId);
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting task",
        description:
          "An error occurred while deleting the task. Please try again.",
      });
    }
    // Note: In a real app, you might want to update the local state
    // or refetch todos, depending on your state management approach
  };

  return (
    <Card className="bg-gray-50/50 border-dashed min-w-72 md:min-w-80 flex flex-col max-h-[464px] overflow-hidden justify-between">
      <CardHeader className="p-4 space-y-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">{column.title}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-600"
            onClick={onDeleteColumn}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 overflow-auto flex-grow">
        <Droppable droppableId={column.id.toString()} direction="vertical">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "space-y-2 min-h-[150px] transition-colors duration-200 overflow-y-auto",
                snapshot.isDraggingOver && "bg-gray-100/80 rounded-lg"
              )}
            >
              {todoList.map((todo, index) => (
                <Draggable
                  key={`todo-${todo.id}`}
                  draggableId={todo.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "group bg-white rounded-lg border shadow-sm",
                        snapshot.isDragging && "rotate-2 shadow-lg"
                      )}
                    >
                      <div className="p-3 flex items-start gap-2">
                        <div
                          {...provided.dragHandleProps}
                          className="mt-1 opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity"
                        >
                          <Grip className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{todo.title}</p>
                          {todo.dueDate ? (
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(todo.dueDate).toLocaleDateString()}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              No due date
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteTodo(todo.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
      <CardFooter className="p-2 mt-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="w-full justify-start ">
              <Plus className="h-4 w-4 mr-2" />
              Add task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTodo();
              }}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task">Task name</Label>
                  <Input
                    id="task"
                    placeholder="Enter task name..."
                    value={todoTitle}
                    onChange={(e) => setTodoTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Due date</Label>
                  <Input
                    id="date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDate(new Date(e.target.value))}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Add task
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default Column;
