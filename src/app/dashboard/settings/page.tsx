import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, business, and billing settings.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="john.doe@example.com" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Profile</Button>
        </CardFooter>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Business</CardTitle>
          <CardDescription>Manage your business details and white-label options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-name">Business Name</Label>
            <Input id="business-name" defaultValue="The Cozy Corner Cafe" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select defaultValue="en">
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="white-label" className="font-semibold">White-Label Mode</Label>
              <p className="text-sm text-muted-foreground">
                For agencies to offer this platform under their own brand.
              </p>
            </div>
            <Switch id="white-label" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Business Settings</Button>
        </CardFooter>
      </Card>
      
      <Separator />

       <Card>
        <CardHeader>
          <CardTitle>Billing & Subscription</CardTitle>
          <CardDescription>Manage your subscription plan and payment methods.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="rounded-lg border bg-card text-card-foreground p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">Pro Plan</p>
                        <p className="text-sm text-muted-foreground">$49.99 / month</p>
                    </div>
                    <Button variant="outline">Change Plan</Button>
                </div>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">Next payment on Dec 1, 2024.</p>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
