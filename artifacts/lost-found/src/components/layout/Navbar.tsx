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
import { Home, MapPin, Menu, Search, PlusCircle, LayoutDashboard, LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const isAdmin = user?.emailAddresses.some(
    ({ emailAddress }) => emailAddress.trim().toLowerCase() === "liebesta2903@gmail.com",
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgba(38,48,80,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/80">
      <div className="container mx-auto flex h-[4.5rem] items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="CampusFound home">
            <div className="rounded-2xl bg-gradient-to-br from-primary via-violet-500 to-cyan-400 p-2.5 text-white shadow-lg shadow-primary/20">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline-block">
              Campus<span className="text-primary">Found</span>
            </span>
          </Link>
          <nav className="liquid-control hidden items-center gap-1 rounded-full p-1 md:flex">
            <Link href="/browse" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-900/10 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white">
              Browse Items
            </Link>
            <Link href="/report" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-900/10 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white">
              Report Item
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="liquid-glass w-[min(22rem,88vw)] border-l border-white/30 bg-white/95 pt-8 dark:bg-slate-950/95">
              <SheetHeader className="mb-8 text-left"><SheetTitle className="flex items-center gap-2"><span className="rounded-xl bg-primary p-2 text-white"><MapPin className="h-4 w-4" /></span>CampusFound</SheetTitle></SheetHeader>
              <nav aria-label="Mobile navigation" className="flex flex-col gap-2">
                <MobileNavLink href="/" icon={Home}>Home</MobileNavLink>
                <MobileNavLink href="/browse" icon={Search}>Browse Items</MobileNavLink>
                <MobileNavLink href="/report" icon={PlusCircle}>Report an Item</MobileNavLink>
                {isSignedIn && <><MobileNavLink href="/my-items" icon={MapPin}>My Reports</MobileNavLink><MobileNavLink href="/my-claims" icon={Search}>My Claims</MobileNavLink></>}
                {isAdmin && <MobileNavLink href="/dashboard" icon={LayoutDashboard}>Admin Dashboard</MobileNavLink>}
              </nav>
            </SheetContent>
          </Sheet>
          <ThemeToggle />
          
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
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label="Open account menu">
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

function MobileNavLink({ href, icon: Icon, children }: { href: string; icon: typeof Home; children: React.ReactNode }) {
  return <SheetClose asChild><Link href={href} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-slate-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-white/10"><Icon className="h-4 w-4 text-primary" />{children}</Link></SheetClose>;
}
