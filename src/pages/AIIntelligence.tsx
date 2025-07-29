import { Brain, TrendingUp, Users, Shield, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AIIntelligence = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">AI Intelligence</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Speed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32ms</div>
            <p className="text-xs text-muted-foreground">
              Average detection time
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Person, Vehicle, Object detection
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Model Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Person Detection</span>
                <span className="text-sm text-muted-foreground">96.8%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "96.8%" }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Object Classification</span>
                <span className="text-sm text-muted-foreground">92.1%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "92.1%" }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Behavior Analysis</span>
                <span className="text-sm text-muted-foreground">89.5%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "89.5%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Recent AI Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Activity className="h-4 w-4 text-primary" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Model updated</p>
                  <p className="text-xs text-muted-foreground">Person detection model v2.1 deployed</p>
                </div>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-primary" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Training completed</p>
                  <p className="text-xs text-muted-foreground">Crowd detection training finished</p>
                </div>
                <span className="text-xs text-muted-foreground">6h ago</span>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-primary" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Security scan</p>
                  <p className="text-xs text-muted-foreground">AI model security validation passed</p>
                </div>
                <span className="text-xs text-muted-foreground">1d ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIIntelligence;