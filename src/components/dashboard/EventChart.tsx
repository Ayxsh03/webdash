import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart-simple";

const mockData = [
  { hour: "00:00", events: 45, footfall: 23, vehicles: 12 },
  { hour: "01:00", events: 32, footfall: 18, vehicles: 8 },
  { hour: "02:00", events: 28, footfall: 15, vehicles: 6 },
  { hour: "03:00", events: 25, footfall: 12, vehicles: 5 },
  { hour: "04:00", events: 31, footfall: 16, vehicles: 7 },
  { hour: "05:00", events: 42, footfall: 28, vehicles: 9 },
  { hour: "06:00", events: 68, footfall: 45, vehicles: 15 },
  { hour: "07:00", events: 95, footfall: 67, vehicles: 22 },
  { hour: "08:00", events: 120, footfall: 85, vehicles: 28 },
  { hour: "09:00", events: 140, footfall: 98, vehicles: 35 },
  { hour: "10:00", events: 165, footfall: 115, vehicles: 42 },
  { hour: "11:00", events: 180, footfall: 125, vehicles: 48 },
];

export const EventChart = () => {
  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Summary of All Events (Hourly)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="hour" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))"
                }}
              />
              <Bar dataKey="footfall" stackId="a" fill="hsl(var(--primary))" name="Footfall" />
              <Bar dataKey="vehicles" stackId="a" fill="hsl(var(--info))" name="Vehicles" />
              <Bar dataKey="events" stackId="a" fill="hsl(var(--warning))" name="Other Events" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};