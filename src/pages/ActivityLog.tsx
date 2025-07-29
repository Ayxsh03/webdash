import { useState } from "react";
import { Activity, Filter, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const ActivityLog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const activityLogs = [
    {
      id: "1",
      message: "John has logged in to panel on July 23rd, 2025 at 11:50 AM",
      timestamp: "2025-07-23T11:50:00Z"
    },
    {
      id: "2", 
      message: "John has logged in to panel on July 23rd, 2025 at 11:44 AM",
      timestamp: "2025-07-23T11:44:00Z"
    },
    {
      id: "3",
      message: "John has logged in to panel on July 23rd, 2025 at 11:44 AM", 
      timestamp: "2025-07-23T11:44:00Z"
    },
    {
      id: "4",
      message: "John has logged in to panel on July 23rd, 2025 at 11:07 AM",
      timestamp: "2025-07-23T11:07:00Z"
    },
    {
      id: "5",
      message: "John has logged in to panel on July 23rd, 2025 at 10:32 AM",
      timestamp: "2025-07-23T10:32:00Z"
    },
    {
      id: "6",
      message: "John has logged in to panel on July 23rd, 2025 at 10:32 AM",
      timestamp: "2025-07-23T10:32:00Z"
    },
    {
      id: "7", 
      message: "John has logged in to panel on July 23rd, 2025 at 10:31 AM",
      timestamp: "2025-07-23T10:31:00Z"
    },
    {
      id: "8",
      message: "John edited a Event type on July 23rd, 2025 at 10:21 AM",
      timestamp: "2025-07-23T10:21:00Z"
    },
    {
      id: "9",
      message: "John edited a device on July 23rd, 2025 at 10:13 AM", 
      timestamp: "2025-07-23T10:13:00Z"
    }
  ];

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === activityLogs.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(activityLogs.map(log => log.id));
    }
  };

  const handleDelete = () => {
    console.log("Delete selected items:", selectedItems);
  };

  const handleDeleteAll = () => {
    console.log("Delete all items");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Activity</h1>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Activity Log List</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={handleDelete}
            disabled={selectedItems.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            DELETE
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={handleDeleteAll}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            DELETE ALL
          </Button>
          <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <Filter className="h-4 w-4 mr-2" />
            FILTER
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search activity logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Activity Log List */}
      <Card className="bg-card border-border p-6">
        <div className="space-y-4">
          {/* Select All Header */}
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <Checkbox
              checked={selectedItems.length === activityLogs.length}
              onCheckedChange={handleSelectAll}
              className="border-border data-[state=checked]:bg-primary"
            />
            <span className="text-sm font-medium text-muted-foreground">
              Select All ({selectedItems.length}/{activityLogs.length})
            </span>
          </div>

          {/* Activity Items */}
          {activityLogs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 py-2 hover:bg-muted/50 rounded">
              <Checkbox
                checked={selectedItems.includes(log.id)}
                onCheckedChange={() => handleSelectItem(log.id)}
                className="border-border data-[state=checked]:bg-primary"
              />
              <Activity className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-foreground flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ActivityLog;