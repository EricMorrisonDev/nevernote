import { LoginForm } from "./components/auth/LoginForm";
import { LogoutButton } from "./components/auth/LogoutButton";

export default function Home() {
  return (
    <div>
        <LoginForm />
        <LogoutButton />
    </div>
  );
}
