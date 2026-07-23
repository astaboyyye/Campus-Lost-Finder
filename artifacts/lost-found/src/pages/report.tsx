import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCreateItem, useGetUploadUrl, ItemInputType } from "@workspace/api-client-react";
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

const CAMPUS_LOCATIONS = [
  "Main Entrance", "Oval Park", "Chancellor Complex", "Chancellor Complex Plaza", "Chancellor Hall",
  "Information Resource Centre", "Academic Complex", "Research and Development Building", "Research Park",
  "Main Hall", "Lecture Hall 1", "Lecture Hall 2", "Lecture Hall 3", "Registry",
  "Centre for Excellence in Teaching and Learning", "Teaching and Research Laboratories", "Guest House",
  "Guest Apartment", "An-Nur Mosque", "An-Nur Islamic Centre", "Village 1", "Village 2", "Village 3",
  "Village 4", "Village 5", "Village 6", "Village 7", "Village 4 Student Centre", "Village 5 Student Centre",
  "Village 5 RuBel", "Village 7 RuBel", "Village Cafeterias", "Village Mini Marts", "Village Meeting Rooms",
  "Village Laundry Areas", "Sports Complex", "Swimming Pool", "Gymnasium", "Football Field", "Rugby Field",
  "Futsal Courts", "Basketball Courts", "Volleyball Courts", "Tennis Courts", "Badminton Courts",
  "Squash Courts", "Netball Courts", "Sepak Takraw Courts", "Kayaking Area", "UTP Clinic", "Pocket C",
  "Pocket D", "Block M", "Cafeterias", "Mini Marts", "Student Parking Areas", "Pos Malaysia Service Centre",
] as const;

const formSchema = z.object({
  type: z.enum(["lost", "found"]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  location: z.string().trim().min(2, "Enter where the item was lost or found"),
  dateLostFound: z.string().optional(),
  imageUrl: z.string().url("Upload a photo before submitting"),
});

export default function ReportItem() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createItem = useCreateItem();
  const getUploadUrl = useGetUploadUrl();
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      type: "lost",
      title: "",
      category: "",
      description: "",
      location: "",
      dateLostFound: new Date().toISOString().split('T')[0],
      imageUrl: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createItem.mutate({
      data: {
        ...values,
        type: values.type as ItemInputType,
        imageUrl: values.imageUrl,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Choose an image smaller than 10 MB.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    try {
      const upload = await getUploadUrl.mutateAsync({ data: { filename: file.name, contentType: file.type } });
      const response = await fetch(upload.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!response.ok) throw new Error("Storage upload failed");
      setImageUrl(upload.objectUrl);
      form.setValue("imageUrl", upload.objectUrl, { shouldValidate: true });
      toast({ title: "Image uploaded", description: "The photo is ready to be included with your report." });
    } catch (error: any) {
      URL.revokeObjectURL(previewUrl);
      setImagePreview("");
      setImageUrl("");
      form.setValue("imageUrl", "", { shouldValidate: true });
      toast({ title: "Upload failed", description: error.message || "Could not upload the image.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setImageUrl("");
    form.setValue("imageUrl", "", { shouldValidate: true });
  };

  return (
    <AppLayout>
      <section className="relative flex-1 overflow-hidden py-10 sm:py-16">
        <img src="/background/UTP.webp" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/65 to-indigo-950/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-sky-950/20" />
      <div className="container relative z-10 mx-auto max-w-3xl px-4">
        <div className="mb-8 text-white">
          <div className="mb-4 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-md">
            <MapPin className="mr-2 h-4 w-4 text-cyan-200" />Campus report
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">Report an Item</h1>
          <p className="max-w-2xl text-base text-slate-100 sm:text-lg">Provide details about the item you lost or found to help the community.</p>
        </div>

        <div className="liquid-glass overflow-visible rounded-[2rem] border-white/30 shadow-2xl">
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
                            <Label htmlFor="report-lost" className={`block cursor-pointer rounded-xl border-2 p-4 transition-colors ${field.value === 'lost' ? 'border-destructive bg-destructive/10' : 'border-border bg-white/20 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                              <RadioGroupItem id="report-lost" value="lost" className="sr-only" />
                              <div className="flex flex-col items-center text-center gap-2">
                                <div className={`p-2 rounded-full ${field.value === 'lost' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                                  <MapPin className="h-6 w-6" />
                                </div>
                                <div className="font-semibold">I Lost Something</div>
                                <p className="text-xs text-muted-foreground">Report an item you misplaced</p>
                              </div>
                            </Label>
                          </FormControl>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <Label htmlFor="report-found" className={`block cursor-pointer rounded-xl border-2 p-4 transition-colors ${field.value === 'found' ? 'border-primary bg-primary/10' : 'border-border bg-white/20 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                              <RadioGroupItem id="report-found" value="found" className="sr-only" />
                              <div className="flex flex-col items-center text-center gap-2">
                                <div className={`p-2 rounded-full ${field.value === 'found' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                  <ImagePlus className="h-6 w-6" />
                                </div>
                                <div className="font-semibold">I Found Something</div>
                                <p className="text-xs text-muted-foreground">Help return a found item</p>
                              </div>
                            </Label>
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
                    <FormItem className="space-y-3">
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
                    <FormItem className="space-y-3">
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
                    <FormItem className="space-y-3">
                      <FormLabel>Location {form.watch('type') === 'lost' ? 'Lost' : 'Found'}</FormLabel>
                      <FormControl>
                        <LocationAutocomplete value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription>Select a suggested campus place or type a more specific custom location.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateLostFound"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
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
                  <FormItem className="space-y-3">
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

              <div className="space-y-4">
                <Label>Photo</Label>
                <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center bg-muted/20 relative overflow-hidden">
                  {imagePreview ? (
                    <div className="relative w-full aspect-video md:aspect-[21/9]">
                      <img src={imagePreview} alt="Selected item preview" className="w-full h-full object-contain" />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="absolute top-2 right-2"
                        onClick={removeImage}
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
                {form.formState.errors.imageUrl && <p className="text-[0.8rem] font-medium text-destructive">{form.formState.errors.imageUrl.message}</p>}
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setLocation("/browse")}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" disabled={!form.formState.isValid || createItem.isPending || isUploading}>
                  {createItem.isPending ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
      </section>
    </AppLayout>
  );
}

function LocationAutocomplete({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [isFocused, setIsFocused] = useState(false);
  const query = value.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (!query) return [];
    return CAMPUS_LOCATIONS
      .filter(location => location.toLowerCase().includes(query))
      .sort((a, b) => Number(!a.toLowerCase().startsWith(query)) - Number(!b.toLowerCase().startsWith(query)))
      .slice(0, 8);
  }, [query]);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={event => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
        autoComplete="off"
        placeholder="Start typing or enter a custom location…"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isFocused && query.length > 0 && suggestions.length > 0}
        aria-controls="campus-location-results"
      />
      {isFocused && query.length > 0 && suggestions.length > 0 && (
        <div id="campus-location-results" role="listbox" className="liquid-glass absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border-0 p-1.5 shadow-xl">
          {suggestions.map(location => (
            <button
              key={location}
              type="button"
              role="option"
              aria-selected={value === location}
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-black/10 focus:bg-black/10 focus:outline-none dark:hover:bg-white/10 dark:focus:bg-white/10"
              onMouseDown={event => event.preventDefault()}
              onClick={() => { onChange(location); setIsFocused(false); }}
            >
              <MapPin className="mr-2 inline h-4 w-4 text-primary" />{location}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
