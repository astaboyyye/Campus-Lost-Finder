import { AppLayout } from "@/components/layout/AppLayout";
import { useListClaims } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyClaims() {
  // listClaims automatically returns user's claims if not admin, per API spec comment
  const { data: claims, isLoading } = useListClaims();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Claims</h1>
          <p className="text-muted-foreground">Track the status of items you've claimed.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : claims && claims.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {claims.map((claim) => (
              <Card key={claim.id} className="overflow-hidden flex flex-col shadow-sm border-border/50">
                <CardHeader className="bg-muted/30 pb-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        <Link href={`/items/${claim.itemId}`} className="hover:underline">
                          {claim.itemTitle || `Item #${claim.itemId}`}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Submitted {format(new Date(claim.createdAt), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={`capitalize flex items-center gap-1.5 px-2.5 py-1 ${getStatusColor(claim.status)}`}>
                      {getStatusIcon(claim.status)}
                      {claim.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Your Claim Details:</p>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md line-clamp-3">
                      {claim.description || "No description provided."}
                    </p>
                  </div>
                  
                  {claim.adminNote && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-primary">Admin Note:</p>
                      <p className="text-sm border-l-2 border-primary pl-3 py-1">
                        {claim.adminNote}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-6 border-t mt-4 bg-muted/10">
                  <Link href={`/items/${claim.itemId}`} className="w-full mt-4">
                    <Button variant="outline" className="w-full justify-between">
                      View Original Item <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed rounded-xl bg-card px-4">
            <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No claims yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You haven't submitted any claims for found items yet. When you recognize a lost item that belongs to you, you can claim it from its detail page.
            </p>
            <Link href="/browse">
              <Button>Browse Found Items</Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
