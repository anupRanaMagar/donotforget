import { getAllTodo } from "@/actions/action";
import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  let body;

  try {
    body = await request.json(); // Attempt to parse the request body
  } catch (error) {
    console.error("Failed to parse request body:", error);
    return new Response(
      JSON.stringify({ error: "Invalid JSON in request body" }),
      { status: 400 }
    );
  }

  if (!body || !body.email) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: email" }),
      { status: 400 }
    );
  }

  const email = body.email;

  const todos = await getAllTodo();

  // Get today's datex and calculate one day before
  const today = new Date();
  const oneDayBefore = new Date(today);
  oneDayBefore.setDate(today.getDate() + 1);

  try {
    // Filter todos with dueDate one day before today
    const filteredTodos = todos.filter((todo) => {
      if (!todo.dueDate) {
        return false;
      }
      const dueDate = new Date(todo.dueDate);
      return (
        dueDate.getFullYear() === oneDayBefore.getFullYear() &&
        dueDate.getMonth() === oneDayBefore.getMonth() &&
        dueDate.getDate() === oneDayBefore.getDate()
      );
    });

    if (filteredTodos.length === 0) {
      return new Response(
        JSON.stringify({ message: "No todos with dueDate one day before." }),
        { status: 200 }
      );
    }

    const emailPromises = filteredTodos.map((todo) => {
      return resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: [email],
        subject: `Reminder: Task Due Soon - ${todo.title}`,
        react: EmailTemplate({ firstName: body.firstName, task: todo.title }),
      });
    });

    const emailResponses = await Promise.all(emailPromises);

    return new Response(JSON.stringify({ emailResponses }), { status: 200 });
  } catch (error) {
    console.error("Error sending emails:", error);
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
}
