import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  task: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  task,
}) => (
  <div>
    <h1>
      Hello, {firstName}. Your {task} due date is tommorow!
    </h1>
  </div>
);
