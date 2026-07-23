import { Link } from "wouter";
import { useAuth, useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Search, PlusCircle, LayoutDashboard, LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Navbar() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const isAdmin = user?.emailAddresses.some(
    ({ emailAddress }) => emailAddress.trim().toLowerCase() === "liebesta2903@gmail.com",
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/40 bg-background/60 shadow-[0_8px_30px_rgba(38,48,80,0.06)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/55 dark:border-white/10">
      <div className="container mx-auto flex h-[4.5rem] items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-2xl bg-gradient-to-br from-primary via-violet-500 to-cyan-400 p-2.5 text-white shadow-lg shadow-primary/20">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline-block">
              Campus<span className="text-primary">Found</span>
            </span>
          </Link>
          <nav className="liquid-control hidden items-center gap-1 rounded-full p-1 md:flex">
            <Link href="/browse" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/55 hover:text-foreground dark:hover:bg-white/10">
              Browse Items
            </Link>
            <Link href="/report" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/55 hover:text-foreground dark:hover:bg-white/10">
              Report Item
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/browse" className="md:hidden">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link href="/report" className="hidden sm:inline-flex">
                <Button size="sm" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Report
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border-2 border-primary/10">
                      <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.emailAddresses[0]?.emailAddress}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/my-items">
                    <DropdownMenuItem className="cursor-pointer">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>My Reports</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/my-claims">
                    <DropdownMenuItem className="cursor-pointer">
                      <Search className="mr-2 h-4 w-4" />
                      <span>My Claims</span>
                    </DropdownMenuItem>
                  </Link>
                  {isAdmin && <Link href="/dashboard">
                    <DropdownMenuItem className="cursor-pointer text-primary focus:text-primary">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  </Link>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center">
              <Link href="/sign-in">
                <Button size="sm">Sign in</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
