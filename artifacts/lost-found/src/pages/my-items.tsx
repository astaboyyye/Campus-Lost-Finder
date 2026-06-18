import { AppLayout } from "@/components/layout/AppLayout";
import { useListItems, useGetMe } from "@workspace/api-client-react";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyItems() {
  const { data: me } = useGetMe(); // To verify auth
  const { data, isLoading } = useListItems(); // List items ideally filtered by userId but API spec doesn't expose it directly in params, 
                                             // however in standard setups listItems might auto-filter for 'my-items' if backend supports it, 
                                             // or we filter client-side if we have userId. Assuming API might return all or we filter.

  // In this scenario, we'll filter client-side using clerkUserId if listItems returns all, or assume the backend handles it.
  // The spec doesn't have a specific `mine=true` param. We'll filter client side for safety if `userId` matches `me?.clerkUserId`.
  
  const myItems = data?.items.filter(item => item.userId === me?.clerkUserId) || [];
  
  const myLost = myItems.filter(i => i.type === 'lost');
  const myFound = myItems.filter(i => i.type === 'found');

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Reports</h1>
            <p className="text-muted-foreground">Manage the items you've reported as lost or found.</p>
          </div>
          <Link href="/report">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              New Report
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({myItems.length})</TabsTrigger>
            <TabsTrigger value="lost">Lost ({myLost.length})</TabsTrigger>
            <TabsTrigger value="found">Found ({myFound.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <ItemsGrid items={myItems} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="lost" className="mt-0">
            <ItemsGrid items={myLost} isLoading={isLoading} emptyMessage="You haven't reported any lost items." />
          </TabsContent>
          <TabsContent value="found" className="mt-0">
            <ItemsGrid items={myFound} isLoading={isLoading} emptyMessage="You haven't reported any found items." />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function ItemsGrid({ items, isLoading, emptyMessage = "You haven't reported any items yet." }: { items: any[], isLoading: boolean, emptyMessage?: string }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[4/3] rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl bg-muted/20 px-4">
        <div className="bg-background h-16 w-16 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No items found</h3>
        <p className="text-muted-foreground mb-6">{emptyMessage}</p>
        <Link href="/report">
          <Button variant="outline">Report an Item</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
