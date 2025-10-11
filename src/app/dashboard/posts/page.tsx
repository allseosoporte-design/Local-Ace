import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

import { PlusCircle } from "lucide-react";
import { postsData } from "@/lib/data";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Automated Posts</h1>
          <p className="text-muted-foreground">
            Schedule and publish posts to keep your profile active.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create a new post</DialogTitle>
              <DialogDescription>
                Write your content, add an image, and schedule it for later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="post-content">Post Content</Label>
                        <Textarea id="post-content" placeholder="What's new?" className="min-h-[150px]" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="picture">Image</Label>
                        <Input id="picture" type="file" />
                    </div>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                    <Label>Schedule Date</Label>
                    <Calendar
                        mode="single"
                        className="rounded-md border"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" variant="secondary">Save Draft</Button>
                <Button type="submit">Schedule Post</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Posts</CardTitle>
          <CardDescription>
            Manage your scheduled, drafted, and published posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={postsData} />
        </CardContent>
      </Card>
    </div>
  );
}
