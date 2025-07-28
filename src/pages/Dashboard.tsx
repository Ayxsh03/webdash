import { Users, Car, Shield, Activity, Zap, UserCheck } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { EventChart } from "@/components/dashboard/EventChart";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <DateRangePicker />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard
          title="Total Events"
          value="2,847"
          icon={Activity}
          trend={{ value: 12.5, label: "from last week" }}
        />
        <StatsCard
          title="Active Devices"
          value="42"
          icon={Shield}
          status="active"
          trend={{ value: 2.1, label: "from last week" }}
        />
        <StatsCard
          title="Inactive Devices"
          value="8"
          icon={Shield}
          status="inactive"
        />
        <StatsCard
          title="Online Devices"
          value="38"
          icon={Zap}
          status="online"
        />
        <StatsCard
          title="Offline Devices"
          value="12"
          icon={Zap}
          status="offline"
        />
        <StatsCard
          title="People Detected"
          value="1,234"
          icon={Users}
          trend={{ value: 8.2, label: "from yesterday" }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EventChart />
        </div>
        <div className="space-y-6">
          <StatsCard
            title="Vehicle Count"
            value="456"
            icon={Car}
            trend={{ value: 15.2, label: "from last hour" }}
            className="h-fit"
          />
          <StatsCard
            title="Attendance Rate"
            value="94.2%"
            icon={UserCheck}
            trend={{ value: 1.8, label: "from yesterday" }}
            className="h-fit"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;