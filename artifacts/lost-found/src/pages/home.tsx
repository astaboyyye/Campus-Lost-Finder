import { Link } from "wouter";
import { useGetRecentItems, useGetItemStats } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, PlusCircle, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: recentItems, isLoading: itemsLoading } = useGetRecentItems({ limit: 4 });
  const { data: stats, isLoading: statsLoading } = useGetItemStats();

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 z-0 opacity-30 dark:opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/40 via-background to-background"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Reuniting students with their stuff
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mb-6">
            Find what you lost. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Return what you found.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            The smart campus network for lost and found items. Report a lost item to alert the community, or post something you found to get it back to its owner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/browse" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 px-8 text-base shadow-lg shadow-primary/20 gap-2">
                <Search className="h-5 w-5" />
                Browse Items
              </Button>
            </Link>
            <Link href="/report" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 px-8 text-base bg-background/50 backdrop-blur border-2 gap-2">
                <PlusCircle className="h-5 w-5" />
                Report an Item
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-card border-y py-12 relative z-20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">
                {statsLoading ? <Skeleton className="h-12 w-24" /> : stats?.totalResolved || 0}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Items Reunited</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-4xl md:text-5xl font-black text-destructive mb-2">
                {statsLoading ? <Skeleton className="h-12 w-24" /> : stats?.totalLost || 0}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Lost</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-4xl md:text-5xl font-black text-secondary mb-2">
                {statsLoading ? <Skeleton className="h-12 w-24" /> : stats?.totalFound || 0}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Found</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-4xl md:text-5xl font-black text-foreground mb-2">
                {statsLoading ? <Skeleton className="h-12 w-24" /> : stats?.totalOpen || 0}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Open</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Items Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Recently Reported</h2>
              <p className="text-muted-foreground">The latest items reported lost or found on campus.</p>
            </div>
            <Link href="/browse" className="hidden sm:flex">
              <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {itemsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-[4/3] rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : recentItems && recentItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-xl border border-dashed">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No items recently reported</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Looks like everything is exactly where it should be. Check back later!
              </p>
            </div>
          )}
          
          <div className="mt-8 sm:hidden flex justify-center">
            <Link href="/browse">
              <Button variant="outline" className="w-full max-w-xs gap-2">
                View All Items <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How CampusFound Works</h2>
            <p className="text-lg text-muted-foreground">A simple, effective way to get lost items back to their rightful owners.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                <AlertCircle className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Report it</h3>
              <p className="text-muted-foreground leading-relaxed">
                Lost something or found an item? Create a quick report with details, location, and a photo to alert the campus.
              </p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-secondary/10 text-secondary-foreground rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300 shadow-sm">
                <Search className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Match it</h3>
              <p className="text-muted-foreground leading-relaxed">
                Browse the database or let others find your report. If you see your lost item, submit a claim with proof of ownership.
              </p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-green-500/10 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Reunite</h3>
              <p className="text-muted-foreground leading-relaxed">
                Once a claim is verified, arrange a safe meeting spot on campus to return the item. Simple and secure.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
