import { AppLayout } from "@/components/layout/AppLayout";
import { useGetMe, useGetItemStats, useListClaims, useListItems, useUpdateClaim } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Link, useLocation } from "wouter";
import { ShieldCheck, ArrowRight, UserCog, Check, X, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function Dashboard() {
  const { data: me, isLoading: meLoading } = useGetMe();
  const [, setLocation] = useLocation();

  if (meLoading) return <AppLayout><div className="p-8"><Skeleton className="h-8 w-48 mb-8" /></div></AppLayout>;
  
  if (me?.role !== 'admin') {
    setLocation("/");
    return null;
  }

  return (
    <AppLayout>
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/20 border-none">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Admin Area
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">System Dashboard</h1>
            </div>
            <Link href="/admin/users">
              <Button variant="outline" className="gap-2 bg-background">
                <UserCog className="h-4 w-4" />
                Manage Users
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <StatsOverview />

        <div className="mt-12">
          <Tabs defaultValue="claims" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="claims">Pending Claims Queue</TabsTrigger>
              <TabsTrigger value="items">Recent Items</TabsTrigger>
            </TabsList>
            
            <TabsContent value="claims" className="mt-0">
              <ClaimsQueue />
            </TabsContent>
            
            <TabsContent value="items" className="mt-0">
              <ItemsTable />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}

function StatsOverview() {
  const { data: stats, isLoading } = useGetItemStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Open</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats?.totalOpen || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Active lost/found listings</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Lost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-destructive">{stats?.totalLost || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-secondary">{stats?.totalFound || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Successfully Reunited</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{stats?.totalResolved || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClaimsQueue() {
  const { data: claims, isLoading } = useListClaims({ status: 'pending' });
  const updateClaim = useUpdateClaim();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedClaimId, setSelectedClaimId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const handleUpdate = (id: number, status: 'approved' | 'rejected') => {
    updateClaim.mutate({
      data: { status, adminNote: adminNote || undefined }
    }, {
      onSuccess: () => {
        toast({ title: `Claim ${status}`, description: `The claim has been marked as ${status}.` });
        setSelectedClaimId(null);
        setAdminNote("");
        queryClient.invalidateQueries({ queryKey: ['/api/claims'] });
        queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message || "Failed to update claim", variant: "destructive" });
      }
    });
  };

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  const pendingClaims = claims?.filter(c => c.status === 'pending') || [];

  if (pendingClaims.length === 0) {
    return (
      <div className="border border-dashed rounded-xl bg-muted/20 p-12 text-center">
        <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No pending claims</h3>
        <p className="text-muted-foreground">The queue is clear. Good job!</p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium">Item</th>
              <th className="px-6 py-4 font-medium">Claimant</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingClaims.map((claim) => (
              <tr key={claim.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-6 py-4 font-medium">
                  <Link href={`/items/${claim.itemId}`} className="text-primary hover:underline flex items-center gap-2">
                    {claim.itemTitle || `Item #${claim.itemId}`}
                    <Eye className="h-3 w-3" />
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div>{claim.userName || 'Unknown'}</div>
                  <div className="text-xs text-muted-foreground">{claim.userEmail}</div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {format(new Date(claim.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setSelectedClaimId(claim.id)}>Review</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Review Claim</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg text-sm">
                          <span className="font-semibold block mb-1">Claimant's description:</span>
                          {claim.description || "No description provided."}
                        </div>
                        <div className="space-y-2">
                          <Label>Admin Note (Optional)</Label>
                          <Textarea 
                            placeholder="Add a note to be sent to the user..."
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter className="flex gap-2">
                        <Button 
                          variant="destructive" 
                          onClick={() => handleUpdate(claim.id, 'rejected')}
                          disabled={updateClaim.isPending}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button 
                          className="bg-green-600 hover:bg-green-700" 
                          onClick={() => handleUpdate(claim.id, 'approved')}
                          disabled={updateClaim.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ItemsTable() {
  const { data, isLoading } = useListItems({ limit: 10 });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium">Item</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-6 py-4 font-medium">
                  <Link href={`/items/${item.id}`} className="hover:underline">
                    {item.title}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="capitalize">{item.type}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="secondary" className="capitalize">{item.status}</Badge>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {format(new Date(item.createdAt), "MMM d, yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t bg-muted/10 text-center">
        <Link href="/browse">
          <Button variant="ghost" size="sm" className="text-primary">
            View all items in Browse <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
