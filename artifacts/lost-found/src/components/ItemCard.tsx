import { Link } from "wouter";
import { MapPin, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { Item } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const isLost = item.type === "lost";
  
  return (
    <Link href={`/items/${item.id}`}>
      <Card className="overflow-hidden hover-elevate transition-all duration-200 cursor-pointer h-full flex flex-col group border-border/50 shadow-sm hover:shadow-md">
        <div className="relative aspect-[4/3] bg-muted w-full overflow-hidden">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-secondary">
              <MapPin className="h-12 w-12 opacity-50" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={isLost ? "destructive" : "default"} className="font-semibold shadow-sm backdrop-blur-sm bg-opacity-90">
              {isLost ? "LOST" : "FOUND"}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="font-medium shadow-sm backdrop-blur-sm bg-opacity-90 capitalize">
              {item.category}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="p-4 pb-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
        </CardHeader>
        
        <CardContent className="p-4 pt-0 flex-1 flex flex-col gap-2">
          {item.location && (
            <div className="flex items-center text-sm text-muted-foreground gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="line-clamp-1">{item.location}</span>
            </div>
          )}
          {item.dateLostFound && (
            <div className="flex items-center text-sm text-muted-foreground gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{format(new Date(item.dateLostFound), "MMM d, yyyy")}</span>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-3 border-t bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {item.userName?.charAt(0) || "U"}
            </div>
            <span className="line-clamp-1">{item.userName || "Student"}</span>
          </div>
          <Badge variant="outline" className={`capitalize text-[10px] px-2 py-0 h-5 ${
            item.status === 'open' ? 'border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 
            item.status === 'claimed' ? 'border-yellow-200 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400' : 
            'border-gray-200 text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {item.status}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
