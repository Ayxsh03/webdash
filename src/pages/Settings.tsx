import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const [selectedDays, setSelectedDays] = useState(["Monday", "Thursday"]);
  const [notifications, setNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                GENERAL
              </TabsTrigger>
              <TabsTrigger value="smtp" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                SMTP
              </TabsTrigger>
              <TabsTrigger value="notification" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                NOTIFICATION
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                WHATSAPP
              </TabsTrigger>
              <TabsTrigger value="telegram" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                TELEGRAM
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="google-api" className="text-foreground">
                    Google place API <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="google-api"
                    placeholder="AIzaSyDk-"
                    defaultValue="AIzaSyDk-"
                    className="bg-background border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">
                    Selected days <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {days.map((day) => (
                      <Badge
                        key={day}
                        variant={selectedDays.includes(day) ? "default" : "outline"}
                        className={`cursor-pointer ${
                          selectedDays.includes(day)
                            ? "bg-primary text-primary-foreground"
                            : "border-muted-foreground hover:bg-muted"
                        }`}
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-time" className="text-foreground">
                    Office Start Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    defaultValue="09:30"
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-time" className="text-foreground">
                    Office End Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    defaultValue="18:30"
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Notification</h3>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">1. Need to display event notifications in the frontend</span>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Update
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="smtp" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="from-mail" className="text-foreground">
                    From mail ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="from-mail"
                    placeholder="suresh.k@visionfacts.ai"
                    defaultValue="suresh.k@visionfacts.ai"
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="host" className="text-foreground">
                    Host <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="host"
                    placeholder="smtp.zoho.in"
                    defaultValue="smtp.zoho.in"
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-foreground">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    placeholder="hello@nextbraintech.com"
                    defaultValue="hello@nextbraintech.com"
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    defaultValue="************"
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="port" className="text-foreground">
                    Port <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="port"
                    placeholder="465"
                    defaultValue="465"
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Update
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notification" className="space-y-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Notification settings will be configured here.</p>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Update
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="whatsapp" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-id" className="text-foreground">
                    Whatsapp Id <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="whatsapp-id"
                    placeholder="194780447058170"
                    defaultValue="194780447058170"
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp-token" className="text-foreground">
                    Whatsapp token <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="whatsapp-token"
                    placeholder="EAACRZAua7xCQBO0s6jBAQbkI4XGhFxFEgEHmTu3YLKF"
                    defaultValue="EAACRZAua7xCQBO0s6jBAQbkI4XGhFxFEgEHmTu3YLKF"
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">1. Need to notify the whatsapp</span>
                  <Switch
                    checked={whatsappNotifications}
                    onCheckedChange={setWhatsappNotifications}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">
                    Event Types <span className="text-red-500">*</span>
                  </Label>
                  <Select defaultValue="footfall">
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select the event types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="footfall">
                        <Badge variant="secondary" className="bg-primary/10 text-primary mr-2">
                          Footfall
                        </Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Update
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="telegram" className="space-y-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Telegram settings will be configured here.</p>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Update
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;