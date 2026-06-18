import { AppLayout } from "@/components/layout/AppLayout";
import { useGetMe, useListUsers, useUpdateUserRole } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ShieldAlert, User as UserIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminUsers() {
  const { data: me, isLoading: meLoading } = useGetMe();
  const [, setLocation] = useLocation();
  const { data: users, isLoading: usersLoading } = useListUsers();
  const updateRole = useUpdateUserRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (meLoading) return <AppLayout><div className="p-8"><Skeleton className="h-8 w-48 mb-8" /></div></AppLayout>;
  
  if (me?.role !== 'admin') {
    setLocation("/");
    return null;
  }

  const handleRoleChange = (userId: string, newRole: 'admin' | 'user') => {
    updateRole.mutate({
      data: { role: newRole }
    }, {
      onSuccess: () => {
        toast({ title: "Role Updated", description: `User role has been updated to ${newRole}.` });
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      },
      onError: (err: any) => {
        toast({ title: "Update Failed", description: err.message || "Failed to update role.", variant: "destructive" });
      }
    });
  };

  return (
    <AppLayout>
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground">Manage user roles and permissions.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {usersLoading ? (
          <Skeleton className="h-96 w-full rounded-xl" />
        ) : (
          <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Contact</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {user.name?.charAt(0) || user.email.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{user.name || 'Unnamed User'}</div>
                            {user.studentId && <div className="text-xs text-muted-foreground">ID: {user.studentId}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{user.email}</div>
                        {user.phone && <div className="text-xs text-muted-foreground">{user.phone}</div>}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        {user.clerkUserId === me.clerkUserId ? (
                          <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/20 border-none shadow-none">
                            You (Admin)
                          </Badge>
                        ) : (
                          <Select 
                            defaultValue={user.role} 
                            onValueChange={(val) => handleRoleChange(user.clerkUserId, val as 'admin'|'user')}
                            disabled={updateRole.isPending}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
