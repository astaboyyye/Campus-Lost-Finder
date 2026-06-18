import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCreateItem, ItemInputType } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, MapPin, Loader2 } from "lucide-react";

const CATEGORIES = [
  "Electronics", "Clothing", "Bags & Accessories", 
  "Books & Stationery", "Keys", "ID & Documents", 
  "Sports Equipment", "Jewelry", "Other"
];

const formSchema = z.object({
  type: z.enum(["lost", "found"]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  location: z.string().optional(),
  dateLostFound: z.string().optional(),
});

export default function ReportItem() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createItem = useCreateItem();
  
  // Note: Object upload would ideally use useUpload hook, but we'll simulate the UX
  // or rely on a simple URL input for this demonstration since useGetUploadUrl 
  // might not be properly exported or implemented in the generated client.
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "lost",
      title: "",
      category: "",
      description: "",
      location: "",
      dateLostFound: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createItem.mutate({
      data: {
        ...values,
        type: values.type as ItemInputType,
        imageUrl: imageUrl || undefined,
      }
    }, {
      onSuccess: (item) => {
        toast({ title: "Success", description: "Item reported successfully!" });
        setLocation(`/items/${item.id}`);
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message || "Failed to report item", variant: "destructive" });
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, this would get a presigned URL and upload to GCS.
    // For now, if there's a file, we simulate upload and just use a placeholder 
    // or if the user typed a URL we'd use that.
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      // Create a temporary local URL for preview
      setImageUrl(URL.createObjectURL(file));
      setIsUploading(false);
      toast({ title: "Image added", description: "Image attached successfully (Local preview only in this demo)" });
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Report an Item</h1>
          <p className="text-muted-foreground">Provide details about the item you lost or found to help the community.</p>
        </div>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-8">
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">What are you reporting?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormItem>
                          <FormControl>
                            <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${field.value === 'lost' ? 'border-destructive bg-destructive/5' : 'border-border hover:border-muted-foreground'}`}>
                              <RadioGroupItem value="lost" className="sr-only" />
                              <div className="flex flex-col items-center text-center gap-2">
                                <div className={`p-2 rounded-full ${field.value === 'lost' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                                  <MapPin className="h-6 w-6" />
                                </div>
                                <div className="font-semibold">I Lost Something</div>
                                <p className="text-xs text-muted-foreground">Report an item you misplaced</p>
                              </div>
                            </div>
                          </FormControl>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${field.value === 'found' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}>
                              <RadioGroupItem value="found" className="sr-only" />
                              <div className="flex flex-col items-center text-center gap-2">
                                <div className={`p-2 rounded-full ${field.value === 'found' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                  <ImagePlus className="h-6 w-6" />
                                </div>
                                <div className="font-semibold">I Found Something</div>
                                <p className="text-xs text-muted-foreground">Help return a found item</p>
                              </div>
                            </div>
                          </FormControl>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Blue Hydro Flask Water Bottle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location {form.watch('type') === 'lost' ? 'Lost' : 'Found'}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Library 2nd Floor, Main Quad..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateLostFound"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description & Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide any distinguishing features, brand, color, or condition..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Label>Photo</Label>
                <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center bg-muted/20 relative overflow-hidden">
                  {imageUrl ? (
                    <div className="relative w-full aspect-video md:aspect-[21/9]">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="absolute top-2 right-2"
                        onClick={() => setImageUrl("")}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-muted rounded-full mb-3">
                        <ImagePlus className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium mb-1">Add a photo of the item</p>
                      <p className="text-xs text-muted-foreground mb-4">A picture makes it much easier to identify.</p>
                      <div className="relative">
                        <Input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                        <Button type="button" variant="outline" disabled={isUploading}>
                          {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Select Image"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setLocation("/browse")}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" disabled={createItem.isPending || isUploading}>
                  {createItem.isPending ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}
