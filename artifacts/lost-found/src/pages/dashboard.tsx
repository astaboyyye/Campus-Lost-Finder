import { useMemo, useState } from "react";
import { useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "wouter";
import {
  useGetItemStats, useGetMe, useListClaims, useListItems, useListUsers,
  useUpdateClaim, useUpdateItem,
} from "@workspace/api-client-react";
import { Activity, Bell, Check, ChevronRight, ClipboardList, Eye, PackageSearch, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAIL = "liebesta2903@gmail.com";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { isLoading } = useGetMe();
  const hasAdminEmail = user?.emailAddresses.some(
    ({ emailAddress }) => emailAddress.trim().toLowerCase() === ADMIN_EMAIL,
  );

  if (!isLoaded || isLoading) return <AppLayout><div className="container py-10"><Skeleton className="h-64" /></div></AppLayout>;
  if (!hasAdminEmail) return (
    <AppLayout><div className="container mx-auto max-w-2xl px-4 py-16"><Alert variant="destructive"><ShieldCheck className="h-4 w-4" /><AlertTitle>Admin access required</AlertTitle><AlertDescription>This dashboard is restricted to the designated administrator account.</AlertDescription></Alert></div></AppLayout>
  );

  return <AdminDashboard />;
}

function AdminDashboard() {
  const { data: stats } = useGetItemStats();
  const { data: itemData, isLoading: itemsLoading } = useListItems({ limit: 50 });
  const { data: claims, isLoading: claimsLoading } = useListClaims();
  const { data: users, isLoading: usersLoading } = useListUsers();
  const pending = claims?.filter((claim) => claim.status === "pending").length ?? 0;

  const activity = useMemo(() => [
    ...(itemData?.items ?? []).map(item => ({ id: `item-${item.id}`, at: item.createdAt, text: `${item.userName || item.userEmail || "A user"} reported ${item.type} item “${item.title}”`, kind: "Report" })),
    ...(claims ?? []).map(claim => ({ id: `claim-${claim.id}`, at: claim.updatedAt, text: `${claim.userName || claim.userEmail || "A user"} ${claim.status === "pending" ? "submitted a claim for" : `had a claim ${claim.status} for`} “${claim.itemTitle || `Item #${claim.itemId}`}”`, kind: "Claim" })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 30), [itemData, claims]);

  return <AppLayout>
    <div className="liquid-canvas relative flex-1 pb-16">
    <img src="/background/UTP.webp" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-center" />
    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/88 via-slate-900/72 to-indigo-950/65" />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-sky-950/30" />
    <div className="liquid-orb left-[-8rem] top-24 h-72 w-72 bg-cyan-300/45" />
    <div className="liquid-orb right-[-6rem] top-8 h-80 w-80 bg-violet-300/40 [animation-delay:-4s]" />
    <div className="container relative z-10 mx-auto px-4 pt-8 sm:pt-12"><section className="liquid-glass relative overflow-hidden rounded-[2rem] p-6 sm:p-9"><div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-white/70 to-cyan-200/20 blur-2xl" /><div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><Badge className="liquid-control mb-4 gap-1.5 rounded-full border-0 px-3 py-1 text-foreground shadow-none"><ShieldCheck className="h-3.5 w-3.5 text-primary" />Secure control center</Badge><p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">CampusFound intelligence</p><h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Everything important,<br /><span className="bg-gradient-to-r from-primary via-violet-500 to-cyan-500 bg-clip-text text-transparent">beautifully in focus.</span></h1><p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">Review reports, verify ownership, and guide every item home from one fluid workspace.</p></div><div className="liquid-control flex w-fit items-center gap-3 rounded-2xl p-3 pr-5"><span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-600"><span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400" /><Sparkles className="h-4 w-4" /></span><div><p className="text-xs text-muted-foreground">System status</p><p className="text-sm font-semibold">All systems ready</p></div></div></div></section></div>
    <main className="container relative z-10 mx-auto space-y-8 px-4 py-7">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat title="Open reports" value={stats?.totalOpen ?? 0} icon={PackageSearch} />
        <Stat title="Pending claims" value={pending} icon={ClipboardList} />
        <Stat title="Resolved" value={stats?.totalResolved ?? 0} icon={Check} />
        <Stat title="Users" value={users?.length ?? 0} icon={Users} />
        <Stat title="Recent reports" value={stats?.recentCount ?? 0} icon={Activity} />
      </div>
      <Tabs defaultValue="claims">
        <TabsList className="liquid-control h-auto flex-wrap justify-start rounded-2xl p-1.5"><TabsTrigger className="rounded-xl px-4 data-[state=active]:bg-white/80 data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/10" value="claims">Claims ({claims?.length ?? 0})</TabsTrigger><TabsTrigger className="rounded-xl px-4" value="reports">Reports ({itemData?.total ?? 0})</TabsTrigger><TabsTrigger className="rounded-xl px-4" value="users">Users ({users?.length ?? 0})</TabsTrigger><TabsTrigger className="rounded-xl px-4" value="activity">Activity</TabsTrigger><TabsTrigger className="rounded-xl px-4" value="records">Records</TabsTrigger></TabsList>
        <TabsContent value="claims" className="mt-6"><ClaimsTable claims={claims ?? []} loading={claimsLoading} /></TabsContent>
        <TabsContent value="reports" className="mt-6"><ReportsTable items={itemData?.items ?? []} loading={itemsLoading} /></TabsContent>
        <TabsContent value="users" className="mt-6"><UsersTable users={users ?? []} loading={usersLoading} /></TabsContent>
        <TabsContent value="activity" className="mt-6"><ActivityFeed activity={activity} /></TabsContent>
        <TabsContent value="records" className="mt-6"><Records claims={claims ?? []} items={itemData?.items ?? []} /></TabsContent>
      </Tabs>
    </main></div>
  </AppLayout>;
}

function Stat({ title, value, icon: Icon }: { title: string; value: number; icon: typeof Activity }) {
  return <Card className="liquid-glass group rounded-[1.6rem] border-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle><span className="rounded-xl bg-primary/10 p-2.5 text-primary transition-transform group-hover:scale-110"><Icon className="h-4 w-4" /></span></CardHeader><CardContent className="flex items-end justify-between"><div className="text-4xl font-semibold tracking-[-0.04em]">{value}</div><ChevronRight className="mb-1 h-4 w-4 text-muted-foreground/60" /></CardContent></Card>;
}

function ClaimsTable({ claims, loading }: { claims: any[]; loading: boolean }) {
  const update = useUpdateClaim(); const client = useQueryClient(); const { toast } = useToast();
  const [note, setNote] = useState("");
  const decide = (id: number, status: "approved" | "rejected") => update.mutate({ id, data: { status, adminNote: note || `Your ownership claim was ${status}.` } }, { onSuccess: () => { setNote(""); client.invalidateQueries(); toast({ title: `Claim ${status}`, description: "The decision and notification were saved to the claim record." }); }, onError: (error: any) => toast({ title: "Update failed", description: error.message, variant: "destructive" }) });
  if (loading) return <Skeleton className="h-80" />;
  return <Panel title="Ownership claims" description="Review proof, verify ownership, approve or reject, and notify claimants."><TableShell headers={["Item", "Claimant", "Evidence", "Status", "Updated", "Action"]}>{claims.map(c => <tr className="border-b" key={c.id}><td className="p-3"><Link href={`/items/${c.itemId}`} className="font-medium hover:underline">{c.itemTitle || `Item #${c.itemId}`}</Link></td><td className="p-3"><div>{c.userName || "Unknown"}</div><small className="text-muted-foreground">{c.userEmail}</small></td><td className="p-3 max-w-xs truncate">{c.description || "No written evidence"}</td><td className="p-3"><Status value={c.status} /></td><td className="p-3 text-muted-foreground">{format(new Date(c.updatedAt), "MMM d, yyyy")}</td><td className="p-3"><Dialog><DialogTrigger asChild><Button size="sm" variant="outline"><Eye className="mr-1 h-4 w-4" />Review</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Review claim #{c.id}</DialogTitle></DialogHeader><div className="space-y-4"><div className="rounded-lg bg-muted p-4"><p className="text-sm font-medium">Ownership evidence</p><p className="mt-1 text-sm text-muted-foreground">{c.description || "No description provided."}</p>{c.proofImageUrl && <a className="mt-2 inline-block text-sm text-primary underline" href={c.proofImageUrl} target="_blank" rel="noreferrer">View proof image</a>}</div><div><Label htmlFor={`note-${c.id}`}>Notification to claimant</Label><Textarea id={`note-${c.id}`} value={note} onChange={e => setNote(e.target.value)} placeholder="Explain the decision or request next steps…" /></div></div><DialogFooter><Button variant="destructive" disabled={update.isPending} onClick={() => decide(c.id, "rejected")}><X className="mr-1 h-4 w-4" />Reject</Button><Button disabled={update.isPending} onClick={() => decide(c.id, "approved")}><Bell className="mr-1 h-4 w-4" />Approve & notify</Button></DialogFooter></DialogContent></Dialog></td></tr>)}</TableShell></Panel>;
}

function ReportsTable({ items, loading }: { items: any[]; loading: boolean }) {
  const update = useUpdateItem(); const client = useQueryClient(); const { toast } = useToast();
  const change = (id: number, status: "open" | "claimed" | "resolved") => update.mutate({ id, data: { status } }, { onSuccess: () => { client.invalidateQueries(); toast({ title: "Report updated", description: `Item status changed to ${status}.` }); } });
  if (loading) return <Skeleton className="h-80" />;
  return <Panel title="Lost and found reports" description="Manage every report and keep item statuses current."><TableShell headers={["Report", "Reporter", "Type", "Claims", "Created", "Status"]}>{items.map(i => <tr className="border-b" key={i.id}><td className="p-3"><Link href={`/items/${i.id}`} className="font-medium hover:underline">{i.title}</Link><div className="text-xs text-muted-foreground">{i.category} · {i.location || "No location"}</div></td><td className="p-3 text-sm">{i.userName || i.userEmail || "Unknown"}</td><td className="p-3"><Badge variant="outline" className="capitalize">{i.type}</Badge></td><td className="p-3">{i.claimCount ?? 0}</td><td className="p-3 text-muted-foreground">{format(new Date(i.createdAt), "MMM d, yyyy")}</td><td className="p-3"><Select value={i.status} onValueChange={(value) => change(i.id, value as any)} disabled={update.isPending}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="claimed">Claimed</SelectItem><SelectItem value="resolved">Resolved</SelectItem></SelectContent></Select></td></tr>)}</TableShell></Panel>;
}

function UsersTable({ users, loading }: { users: any[]; loading: boolean }) { if (loading) return <Skeleton className="h-80" />; return <Panel title="User accounts" description="View registered accounts and their report activity. Admin access remains locked to the designated email."><TableShell headers={["User", "Email", "Student ID", "Phone", "Joined", "Access"]}>{users.map(u => <tr className="border-b" key={u.id}><td className="p-3 font-medium">{u.name || "Unnamed user"}</td><td className="p-3">{u.email}</td><td className="p-3 text-muted-foreground">{u.studentId || "—"}</td><td className="p-3 text-muted-foreground">{u.phone || "—"}</td><td className="p-3 text-muted-foreground">{format(new Date(u.createdAt), "MMM d, yyyy")}</td><td className="p-3"><Status value={u.role} /></td></tr>)}</TableShell></Panel>; }

function ActivityFeed({ activity }: { activity: any[] }) { return <Panel title="User activity" description="A chronological audit view derived from preserved report and claim records."><div className="divide-y">{activity.map(a => <div className="flex gap-3 py-4" key={a.id}><div className="mt-1 rounded-full bg-primary/10 p-2"><Activity className="h-4 w-4 text-primary" /></div><div><Badge variant="outline">{a.kind}</Badge><p className="mt-1 text-sm">{a.text}</p><p className="text-xs text-muted-foreground">{format(new Date(a.at), "MMM d, yyyy 'at' h:mm a")}</p></div></div>)}{!activity.length && <p className="py-8 text-center text-muted-foreground">No activity yet.</p>}</div></Panel>; }

function Records({ claims, items }: { claims: any[]; items: any[] }) { const rows = [...items.map(i => ({ id: `R-${i.id}`, type: "Report", subject: i.title, status: i.status, at: i.updatedAt })), ...claims.map(c => ({ id: `C-${c.id}`, type: "Claim", subject: c.itemTitle || `Item #${c.itemId}`, status: c.status, at: c.updatedAt }))].sort((a,b) => +new Date(b.at) - +new Date(a.at)); return <Panel title="Report and claim records" description="A unified, date-ordered register for administrative record keeping."><TableShell headers={["Record", "Type", "Subject", "Status", "Last updated"]}>{rows.map(r => <tr className="border-b" key={r.id}><td className="p-3 font-mono text-xs">{r.id}</td><td className="p-3">{r.type}</td><td className="p-3 font-medium">{r.subject}</td><td className="p-3"><Status value={r.status} /></td><td className="p-3 text-muted-foreground">{format(new Date(r.at), "MMM d, yyyy h:mm a")}</td></tr>)}</TableShell></Panel>; }

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <Card className="liquid-glass rounded-[2rem] border-0"><CardHeader className="px-6 pt-6 sm:px-8 sm:pt-8"><CardTitle className="text-2xl tracking-tight">{title}</CardTitle><p className="text-sm text-muted-foreground">{description}</p></CardHeader><CardContent className="px-3 pb-3 sm:px-5 sm:pb-5">{children}</CardContent></Card>; }
function TableShell({ headers, children }: { headers: string[]; children: React.ReactNode }) { return <div className="overflow-x-auto rounded-[1.35rem] border border-white/50 bg-white/25 dark:border-white/10 dark:bg-black/10"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-white/35 backdrop-blur-xl dark:bg-white/5"><tr>{headers.map(h => <th className="p-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" key={h}>{h}</th>)}</tr></thead><tbody className="[&_tr]:transition-colors [&_tr:hover]:bg-white/30 dark:[&_tr:hover]:bg-white/5">{children}</tbody></table></div>; }
function Status({ value }: { value: string }) { const good = ["approved", "resolved", "admin"].includes(value); const bad = value === "rejected"; return <Badge variant={bad ? "destructive" : good ? "default" : "secondary"} className="capitalize">{value}</Badge>; }
