import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { getInitialsFromEmail } from '@/lib/avatar-generator';
import { removeTokens } from '@/lib/cookies';
import { useUserStore } from '@/store/user';
import { useNavigate } from 'react-router';

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
    navigate('/');
  };

  return (
    <nav className="flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-0 px-4 sm:px-6 py-4 border-b bg-background w-full">
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 w-full md:w-auto">
        <h1 className="text-xl font-bold">Tasks</h1>
        <ThemeToggle />
        {user && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground md:ml-4 mt-2 md:mt-0">
            <span className="rounded-full w-8 h-8 flex items-center justify-center bg-muted font-bold border">
              {getInitialsFromEmail(user.email)}
            </span>
            {user.email}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>
    </nav>
  );
}
