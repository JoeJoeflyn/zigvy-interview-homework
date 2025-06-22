import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getInitialsFromEmail } from "@/lib/avatar-generator";
import { removeTokens } from "@/lib/cookies";
import { useUserStore } from "@/store/user";
import { useNavigate } from "react-router";

export function Navbar() {
  // get user from store
  const user = useUserStore((state) => state.user);
  // handle clear user from store
  const clearUser = useUserStore((state) => state.clearUser);
  // handle navigate page
  const navigate = useNavigate();

  // clear cookies and clear store after logout
  const handleLogout = () => {
    removeTokens();
    clearUser();
    navigate("/");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-background">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Tasks</h1>
        <ThemeToggle />
        {user && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground ml-4">
            <span className="rounded-full w-8 h-8 flex items-center justify-center bg-muted font-bold border">
              {getInitialsFromEmail(user.email)}
            </span>
            {user.email}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>
    </nav>
  );
}