import { LogoutButton } from "./components/auth/LogoutButton";
import { CreateStackForm } from "./components/stacks/CreateStackForm";
import { GetStacksForm } from "./components/stacks/GetStacksForm";
import { AuthForm } from "./components/auth/AuthForm";
import { LoginStatus } from "./components/auth/LoginStatus";

// we need to reconfigure sign up and login so that they are on one server component
// this will allow that individual form to use state to toggle
// this page should be a server component, not a client component

export default function Home() {

  return (
    <div className="flex flex-col p-10 gap-4">
      <div>
        <LoginStatus/>
      </div>
      <div className="mb-3">
        <AuthForm/>
      </div>
      <h2 className="text-[1.2rem]">
        <strong>
          Create Stacks Here
        </strong>
        </h2>
      <div>
        <CreateStackForm/>
      </div>
      <h2 className="text-[1.2rem]">
        <strong>
          View Stacks Here
        </strong>
      </h2>
      <div>
        <GetStacksForm/>
      </div>
      <div>
        <LogoutButton/>
      </div>
    </div>
  );
}
