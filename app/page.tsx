import { LogoutButton } from "./components/auth/LogoutButton";
import { AuthForm } from "./components/auth/AuthForm";
import { CreateStackForm } from "./components/stacks/CreateStackForm";
import { GetStacksForm } from "./components/stacks/GetStacksForm";
import { LoginStatus } from "./components/auth/LoginStatus";


export default function Home() {

  return (
    <div className="flex flex-col p-10 gap-4">
      <div>
        <LoginStatus />
      </div>
      <div className="mb-3">
        <AuthForm/>
      </div>
      <div>
        <LogoutButton/>
      </div>
      <div>
        <CreateStackForm />
      </div>
      <div>
        <GetStacksForm />
      </div>
    </div>
  );
}
