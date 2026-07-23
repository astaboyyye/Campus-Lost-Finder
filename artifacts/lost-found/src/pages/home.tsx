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
      <section className="relative flex min-h-[680px] items-center overflow-hidden py-16 sm:py-20 lg:min-h-[760px] lg:py-28">
        <img src="/background/UTP.webp" alt="Universiti Teknologi PETRONAS campus" className="absolute inset-0 h-full w-full object-cover object-center" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/68 to-slate-900/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-sky-950/35" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="hero-glass mx-auto max-w-[52rem] rounded-[2rem] p-6 text-left text-white sm:mx-0 sm:p-9 lg:p-11">
          <div className="mb-7 inline-flex items-center rounded-full border border-white/20 bg-slate-950/45 px-3.5 py-1.5 text-sm font-semibold text-white backdrop-blur-xl">
            <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-cyan-300"></span>
            Reuniting students with their stuff
          </div>
          <h1 className="mb-6 max-w-[15ch] text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold leading-[1.02] tracking-[-0.045em] text-white">
            <span className="block">Find what you lost.</span>
            <span className="block bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">Return what you found.</span>
          </h1>
          <p className="mb-9 max-w-2xl text-justify text-base leading-[1.75] text-white/[0.88] sm:text-lg">
            UTP’s dedicated lost-and-found network. Report belongings misplaced around Universiti Teknologi PETRONAS, or help return an item you found to its rightful owner.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link href="/browse" className="w-full sm:w-auto">
              <Button size="lg" className="h-14 w-full gap-2 bg-violet-600 px-8 text-base text-white shadow-lg shadow-violet-600/35 transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-500 hover:brightness-100 hover:shadow-xl hover:shadow-violet-500/40 focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:min-w-48">
                <Search className="h-5 w-5" />
                Browse Items
              </Button>
            </Link>
            <Link href="/report" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-14 w-full gap-2 border-white/55 bg-slate-950/45 px-8 text-base text-white shadow-lg shadow-black/15 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/80 hover:bg-slate-950/70 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:min-w-48">
                <PlusCircle className="h-5 w-5" />
                Report an Item
              </Button>
            </Link>
          </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="relative z-20 -mt-px border-y bg-white py-10 shadow-[0_-18px_45px_rgba(15,23,42,0.16)] dark:bg-slate-950 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-4 md:gap-0">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-center dark:border-white/10 dark:bg-white/5 md:rounded-none md:border-y-0 md:border-l-0 md:bg-transparent">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">
                {statsLoading ? <Skeleton className="h-12 w-24" /> : stats?.totalResolved || 0}
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-sm">Items Reunited</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-center dark:border-white/10 dark:bg-white/5 md:rounded-none md:border-y-0 md:border-l-0 md:bg-transparent">
              <div className="mb-2 text-4xl font-black text-red-700 dark:text-red-400 md:text-5xl">
                {statsLoading ? <Skeleton className="h-12 w-24" /> : stats?.totalLost || 0}
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-sm">Active Lost Items</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-center dark:border-white/10 dark:bg-white/5 md:rounded-none md:border-y-0 md:border-l-0 md:bg-transparent">
              <div className="mb-2 text-4xl font-black text-amber-700 dark:text-amber-400 md:text-5xl">
                {statsLoading ? <Skeleton className="h-12 w-24" /> : stats?.totalFound || 0}
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-sm">Active Found Items</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-center dark:border-white/10 dark:bg-white/5 md:rounded-none md:border-y-0 md:bg-transparent">
              <div className="mb-2 text-4xl font-black text-slate-950 dark:text-white md:text-5xl">
                {statsLoading ? <Skeleton className="h-12 w-24" /> : stats?.totalOpen || 0}
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-sm">Total Open</div>
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
              <p className="text-muted-foreground">The latest items reported across the UTP campus.</p>
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
                Lost or found something at UTP? Create a report with the campus location, identifying details, and a photo to alert the community.
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
