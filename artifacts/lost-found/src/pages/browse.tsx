import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ItemCard } from "@/components/ItemCard";
import { useListItems, ListItemsType, ListItemsStatus } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const CATEGORIES = [
  "Electronics", "Clothing", "Bags & Accessories", 
  "Books & Stationery", "Keys", "ID & Documents", 
  "Sports Equipment", "Jewelry", "Other"
];

export default function BrowseItems() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [type, setType] = useState<ListItemsType | "all">("all");
  const [status, setStatus] = useState<ListItemsStatus | "all">("open");
  const [category, setCategory] = useState<string>("all");

  // Basic debounce implementation
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const { data, isLoading } = useListItems({
    search: debouncedSearch || undefined,
    type: type !== "all" ? type : undefined,
    status: status !== "all" ? status : undefined,
    category: category !== "all" ? category : undefined,
    limit: 50
  });

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setType("all");
    setStatus("open");
    setCategory("all");
  };

  const hasActiveFilters = debouncedSearch !== "" || type !== "all" || status !== "open" || category !== "all";

  const FilterControls = () => (
    <div className="flex flex-col gap-5">
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select value={type} onValueChange={(val) => setType(val as any)}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="lost">Lost Items</SelectItem>
            <SelectItem value="found">Found Items</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select value={status} onValueChange={(val) => setStatus(val as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Status</SelectItem>
            <SelectItem value="open">Open (Active)</SelectItem>
            <SelectItem value="claimed">Claimed (Pending)</SelectItem>
            <SelectItem value="resolved">Resolved (Returned)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select value={category} onValueChange={(val) => setCategory(val)}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full mt-2">
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Browse Items</h1>
          <p className="text-muted-foreground mb-6">Search through items reported across the UTP campus.</p>
          
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by title, description, or location..." 
                className="pl-9 h-11 bg-background"
                value={search}
                onChange={handleSearchChange}
              />
            </form>
            <Button type="button" onClick={handleSearchSubmit} className="w-full sm:w-auto h-11 px-6">
              Search
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto h-11 lg:hidden gap-2 bg-background">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {hasActiveFilters && <Badge variant="secondary" className="ml-1 px-1.5 h-5">!</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="mb-6">
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Refine your search results.</SheetDescription>
                </SheetHeader>
                <FilterControls />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="bg-card border rounded-xl p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">Filters</h2>
            </div>
            <FilterControls />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">
              {isLoading ? "Loading results..." : `Found ${data?.total || 0} items`}
            </p>
            {hasActiveFilters && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Active filters:</span>
                {type !== "all" && <Badge variant="outline" className="capitalize text-xs">{type}</Badge>}
                {status !== "all" && <Badge variant="outline" className="capitalize text-xs">{status}</Badge>}
                {category !== "all" && <Badge variant="outline" className="capitalize text-xs">{category}</Badge>}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-[4/3] rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-card/50 px-4">
              <div className="bg-muted h-20 w-20 rounded-full flex items-center justify-center mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We couldn't find any items matching your current filters. Try adjusting your search criteria.
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
}
