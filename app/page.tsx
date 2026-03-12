import { LogoutButton } from "./components/auth/LogoutButton";
import { AuthForm } from "./components/auth/AuthForm";


export default function Home() {

  return (
    <div className="flex flex-col p-10 gap-4">
     
      <div className="mb-3">
        <AuthForm/>
      </div>
      <div>
        <LogoutButton/>
      </div>
    </div>
  );
}
