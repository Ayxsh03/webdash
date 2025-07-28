import { useState } from "react";
import { Search, Download, Filter, Eye, Trash2, Edit } from "lucide-react";
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
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button variant="gradient" size="sm">
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
              {mockFootfallData.map((event) => (
                <TableRow key={event.id} className="border-border">
                  <TableCell>
                    <div className="w-16 h-12 bg-muted rounded-md flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">IMG</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{event.timestamp}</TableCell>
                  <TableCell className="text-foreground">{event.location}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{event.person_count} people</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={event.confidence > 95 ? "default" : "secondary"}
                      className={event.confidence > 95 ? "bg-success text-success-foreground" : ""}
                    >
                      {event.confidence}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {event.gender} • {event.age_group}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Logs
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Convert
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Footfall;