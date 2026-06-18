import { useState, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetItem, useCreateClaim, useGetMe, getGetItemQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, User, Clock, AlertCircle, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/react";

export default function ItemDetail() {
  const [, params] = useRoute("/items/:id");
  const id = parseInt(params?.id || "0", 10);
  const { data: item, isLoading } = useGetItem(id, { query: { enabled: !!id, queryKey: getGetItemQueryKey(id) } });
  const { data: me } = useGetMe({ query: { enabled: false } }); // Just checking if we can, actually useClerk user
  const { isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [claimOpen, setClaimOpen] = useState(false);
  const [description, setDescription] = useState("");
  
  const createClaim = useCreateClaim();

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast({ title: "Error", description: "Please provide a description.", variant: "destructive" });
      return;
    }

    createClaim.mutate({
      data: {
        itemId: id,
        description
      }
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Claim submitted successfully. An admin will review it." });
        setClaimOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetItemQueryKey(id) });
      },
      onError: (error: any) => {
        toast({ title: "Error", description: error.message || "Failed to submit claim", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!item) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-2">Item not found</h1>
          <p className="text-muted-foreground mb-6">The item you are looking for does not exist or has been removed.</p>
          <Button onClick={() => setLocation("/browse")}>Back to Browse</Button>
        </div>
      </AppLayout>
    );
  }

  const isLost = item.type === "lost";

  return (
    <AppLayout>
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted border shadow-sm relative">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-secondary/10">
                    <MapPin className="h-16 w-16 mb-4 opacity-50 text-secondary" />
                    <p>No image provided</p>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge variant={isLost ? "destructive" : "default"} className="text-sm shadow-md">
                    {isLost ? "LOST ITEM" : "FOUND ITEM"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="capitalize">{item.category}</Badge>
                <Badge variant="outline" className={`capitalize ${
                  item.status === 'open' ? 'border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 
                  item.status === 'claimed' ? 'border-yellow-200 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400' : 
                  'border-gray-200 text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {item.status}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">{item.title}</h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {item.location && (
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Location</p>
                      <p className="font-medium">{item.location}</p>
                    </div>
                  </div>
                )}
                
                {item.dateLostFound && (
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Date {isLost ? "Lost" : "Found"}</p>
                      <p className="font-medium">{format(new Date(item.dateLostFound), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {item.description || "No description provided."}
                </p>
              </div>

              <div className="mt-auto bg-card border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {item.userName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Reported By</p>
                    <p className="font-semibold">{item.userName || "Student"}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-0.5 gap-1">
                      <Clock className="h-3 w-3" />
                      Reported {format(new Date(item.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>

                {item.status === 'open' ? (
                  isSignedIn ? (
                    <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full h-12 text-base gap-2" size="lg">
                          <ShieldCheck className="h-5 w-5" />
                          {isLost ? "I found this item" : "This is my item"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>{isLost ? "Report as Found" : "Claim this Item"}</DialogTitle>
                          <DialogDescription>
                            {isLost 
                              ? "Have you found this lost item? Please provide details so the owner can verify." 
                              : "Is this your lost item? Provide specific details (serial numbers, unique marks, etc.) to prove ownership."}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleClaim} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="description">Details / Proof of Ownership</Label>
                            <Textarea 
                              id="description" 
                              placeholder={isLost ? "Where did you find it? How can the owner contact you?" : "Describe unique identifying features..."}
                              className="h-32"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={createClaim.isPending}>
                            {createClaim.isPending ? "Submitting..." : "Submit"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button className="w-full h-12 text-base" size="lg" onClick={() => setLocation("/sign-in")}>
                      Sign in to {isLost ? "report as found" : "claim this item"}
                    </Button>
                  )
                ) : (
                  <div className="bg-muted p-4 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Not available</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This item is currently marked as {item.status} and cannot be claimed.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
