import { LogoutButton } from "./components/auth/LogoutButton";
import { CreateStackForm } from "./components/stacks/CreateStackForm";
import { GetStacksForm } from "./components/stacks/GetStacksForm";
import { AuthForm } from "./components/auth/AuthForm";

// we need to reconfigure sign up and login so that they are on one server component
// this will allow that individual form to use state to toggle
// this page should be a server component, not a client component

export default function Home() {

  return (
    <div className="flex flex-col p-10 gap-4">
      
      <div>
        <AuthForm/>
      </div>
      <div>
        <CreateStackForm/>
      </div>
      <div>
        <GetStacksForm/>
      </div>
      <div>
        <LogoutButton/>
      </div>
    </div>
  );
}
