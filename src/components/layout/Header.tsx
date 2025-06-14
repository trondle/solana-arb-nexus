
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Shield } from 'lucide-react';

const Header = () => {
  const { user, userRole, signOut } = useAuth();

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'trader': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-semibold">MEV Arbitrage Nexus</h1>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge className={getRoleColor(userRole)}>
                {userRole?.toUpperCase() || 'LOADING'}
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem disabled>
                  <User className="w-4 h-4 mr-2" />
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Shield className="w-4 h-4 mr-2" />
                  Role: {userRole || 'Loading...'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
