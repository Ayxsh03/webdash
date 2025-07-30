import { useState } from "react";
import { Users, Search, Filter, Download, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const PeopleCount = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const kpiData = [
    { label: "Today", value: "24", color: "text-blue-600" },
    { label: "This week", value: "156", color: "text-orange-600" },
    { label: "This month", value: "892", color: "text-purple-600" },
    { label: "This Year", value: "3,247", color: "text-teal-600" },
    { label: "All", value: "12,456", color: "text-blue-800" },
  ];

  const countData = [
    {
      id: "PC001",
      location: "Main Entrance",
      device: "CAM001",
      count: 45,
      timestamp: "2024-01-15 14:30:00",
      image: "/placeholder.svg",
      demographics: { age: "25-35", gender: "Mixed" },
    },
    {
      id: "PC002", 
      location: "Lobby Area",
      device: "CAM002",
      count: 23,
      timestamp: "2024-01-15 14:25:00",
      image: "/placeholder.svg",
      demographics: { age: "18-25", gender: "Female" },
    },
    {
      id: "PC003",
      location: "Exit Gate", 
      device: "CAM003",
      count: 12,
      timestamp: "2024-01-15 14:20:00",
      image: "/placeholder.svg",
      demographics: { age: "35-45", gender: "Male" },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">People Count</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="bg-gradient-card border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-sm text-muted-foreground font-medium mb-1">
                {kpi.label}
              </div>
              <div className={`text-2xl font-bold ${kpi.color}`}>
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search people count by location and device"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => {
              console.log("Export people count data");
              const csvData = "ID,Location,Device,Count,Timestamp\nPC001,Main Entrance,CAM001,45,2024-01-15 14:30:00";
              const blob = new Blob([csvData], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'people-count-data.csv';
              a.click();
              window.URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            EXPORT
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => console.log("Filter people count data")}
          >
            <Filter className="h-4 w-4 mr-2" />
            FILTER
          </Button>
          <Button variant="outline" size="sm">
            <div className="h-4 w-4 mr-2 rounded border" />
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Card className="bg-card border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-foreground">ID</TableHead>
              <TableHead className="text-foreground">Location</TableHead>
              <TableHead className="text-foreground">Device</TableHead>
              <TableHead className="text-foreground">Count</TableHead>
              <TableHead className="text-foreground">Image</TableHead>
              <TableHead className="text-foreground">Demographics</TableHead>
              <TableHead className="text-foreground">Timestamp</TableHead>
              <TableHead className="text-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {countData.map((item) => (
              <TableRow key={item.id} className="border-border">
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    {item.location}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                    {item.device}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {item.count}
                  </Badge>
                </TableCell>
                <TableCell>
                  <img
                    src={item.image}
                    alt="Count snapshot"
                    className="w-12 h-8 object-cover rounded"
                  />
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Age: {item.demographics.age}</div>
                    <div className="text-muted-foreground">Gender: {item.demographics.gender}</div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.timestamp}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-primary hover:bg-primary/10">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem 
                        className="hover:bg-muted cursor-pointer"
                        onClick={() => console.log("View details for:", item.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="hover:bg-muted cursor-pointer"
                        onClick={() => console.log("View history for:", item.id)}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive hover:bg-destructive/10 cursor-pointer"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this record?")) {
                            console.log("Delete:", item.id);
                          }
                        }}
                      >
                        <MoreHorizontal className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default PeopleCount;