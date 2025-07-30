import { useState } from "react";
import { Search, Download, Filter, Eye, Trash2, Edit, MoreHorizontal, RotateCcw } from "lucide-react";
import { useDetectionEvents } from "@/hooks/useDetectionData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const mockFootfallData = [
  {
    id: 1,
    timestamp: "2024-01-28 09:15:23",
    location: "Main Entrance",
    person_count: 5,
    image: "/placeholder.svg",
    confidence: 98.5,
    gender: "Mixed",
    age_group: "Adult",
  },
  {
    id: 2,
    timestamp: "2024-01-28 09:12:45",
    location: "South Gate",
    person_count: 2,
    image: "/placeholder.svg",
    confidence: 95.2,
    gender: "Female",
    age_group: "Adult",
  },
  {
    id: 3,
    timestamp: "2024-01-28 09:08:12",
    location: "Emergency Exit",
    person_count: 1,
    image: "/placeholder.svg",
    confidence: 99.1,
    gender: "Male",
    age_group: "Senior",
  },
];

const Footfall = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const { data: eventsData, isLoading } = useDetectionEvents(page, 10, searchTerm);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Footfall Detection</h1>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-success">
            Today: 1,234 People
          </Badge>
          <Badge variant="secondary" className="text-warning">
            Week: 8,567 People
          </Badge>
          <Badge variant="secondary" className="text-info">
            Month: 34,890 People
          </Badge>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location, time, or person count..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Filter functionality
                  console.log("Filter clicked");
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button 
              variant="gradient" 
              size="sm"
              onClick={() => {
                // Export functionality
                console.log("Export CSV clicked");
                const csvData = "ID,Location,Count,Timestamp\n1,Main Entrance,5,2024-01-28 09:15:23";
                const blob = new Blob([csvData], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'footfall-data.csv';
                a.click();
                window.URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Footfall Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Image</TableHead>
                <TableHead className="text-muted-foreground">Timestamp</TableHead>
                <TableHead className="text-muted-foreground">Location</TableHead>
                <TableHead className="text-muted-foreground">Count</TableHead>
                <TableHead className="text-muted-foreground">Confidence</TableHead>
                <TableHead className="text-muted-foreground">Details</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="w-16 h-12 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 bg-muted animate-pulse rounded w-32" /></TableCell>
                    <TableCell><div className="h-6 bg-muted animate-pulse rounded w-20" /></TableCell>
                    <TableCell><div className="h-4 bg-muted animate-pulse rounded w-8" /></TableCell>
                    <TableCell><div className="h-6 bg-muted animate-pulse rounded w-16" /></TableCell>
                    <TableCell><div className="h-8 bg-muted animate-pulse rounded w-24" /></TableCell>
                    <TableCell><div className="h-8 bg-muted animate-pulse rounded w-8" /></TableCell>
                  </TableRow>
                ))
              ) : eventsData?.events?.length ? (
                eventsData.events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="w-16 h-12 bg-muted rounded overflow-hidden">
                        {event.image_path ? (
                          <img 
                            src={`/api/images/${event.image_path}`}
                            alt="Detection"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">No Image</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{event.camera_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">ID: {event.person_id}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          event.confidence >= 0.8 
                            ? "default" 
                            : event.confidence >= 0.6 
                              ? "secondary" 
                              : "destructive"
                        }
                      >
                        {(event.confidence * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        <div>Alert: {event.alert_sent ? "✓ Sent" : "✗ Not sent"}</div>
                        {event.metadata?.bbox && (
                          <div className="text-xs">
                            Position: {event.metadata.bbox.slice(0, 2).map(Math.round).join(", ")}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => console.log("View details for event:", event.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => console.log("Resend alert for event:", event.id)}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Resend Alert
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive cursor-pointer"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this event?")) {
                                console.log("Delete event:", event.id);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No detection events found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Footfall;