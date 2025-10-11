"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2 } from "lucide-react";
import { recentReviewsData, internalFeedbackData } from "@/lib/data";
import { DataTable } from "@/components/ui/data-table";
import { columns, feedbackColumns } from "./columns";

export default function ReviewsPage() {
  const businessId = "your-business-123";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Review Management</h1>
          <p className="text-muted-foreground">
            Manage your online reputation and engage with customers.
          </p>
        </div>
        <Button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/funnel/${businessId}`)}>
          <Share2 className="mr-2 h-4 w-4" />
          Copy Funnel Link
        </Button>
      </div>

      <Tabs defaultValue="public" className="space-y-4">
        <TabsList>
          <TabsTrigger value="public">Public Reviews</TabsTrigger>
          <TabsTrigger value="feedback">Internal Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="public">
          <Card>
            <CardHeader>
              <CardTitle>5-Star Reviews</CardTitle>
              <CardDescription>
                Reviews from customers who rated you 5 stars.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={recentReviewsData} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Internal Feedback</CardTitle>
              <CardDescription>
                Feedback from customers who rated you 1-4 stars. This is not public.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={feedbackColumns} data={internalFeedbackData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
