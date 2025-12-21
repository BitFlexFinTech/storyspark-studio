import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useScheduledContent, useCreateScheduledContent, useDeleteScheduledContent } from "@/hooks/useContentCalendar";
import { useUploadTimeAnalysis } from "@/hooks/useUploadTimeAnalysis";
import { ChevronLeft, ChevronRight, Plus, Clock, Trash2, Sparkles } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { toast } from "sonner";

export default function ContentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("14:00");
  const [newNotes, setNewNotes] = useState("");

  const { data: scheduledContent = [] } = useScheduledContent(currentMonth);
  const { data: timeAnalysis } = useUploadTimeAnalysis();
  const createContent = useCreateScheduledContent();
  const deleteContent = useDeleteScheduledContent();

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getContentForDay = (date: Date) => {
    return scheduledContent.filter((c) => isSameDay(new Date(c.scheduled_date), date));
  };

  const isOptimalDay = (date: Date) => {
    const dayName = format(date, "EEEE");
    return timeAnalysis?.optimalSlots.some((s) => s.day === dayName && s.confidence === "high");
  };

  const handleAddContent = () => {
    if (!selectedDate || !newTitle.trim()) return;

    createContent.mutate(
      {
        title: newTitle,
        scheduled_date: format(selectedDate, "yyyy-MM-dd"),
        scheduled_time: newTime,
        notes: newNotes || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Content scheduled!");
          setIsAddOpen(false);
          setNewTitle("");
          setNewNotes("");
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <AppLayout>
      <PageHeader
        title="Content Calendar"
        description="Plan and schedule your content with AI-powered optimal upload times"
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                const content = getContentForDay(day);
                const isOptimal = isOptimalDay(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedDate(day);
                      setIsAddOpen(true);
                    }}
                    className={`
                      min-h-24 p-2 rounded-lg border text-left transition-colors
                      ${!isSameMonth(day, currentMonth) ? "opacity-40" : ""}
                      ${isToday ? "border-primary" : "border-border"}
                      ${isOptimal ? "bg-green-500/10" : ""}
                      hover:bg-accent
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>
                        {format(day, "d")}
                      </span>
                      {isOptimal && <Sparkles className="h-3 w-3 text-green-500" />}
                    </div>
                    <div className="mt-1 space-y-1">
                      {content.slice(0, 2).map((c) => (
                        <div
                          key={c.id}
                          className="text-xs p-1 rounded bg-primary/20 text-primary truncate"
                        >
                          {c.title}
                        </div>
                      ))}
                      {content.length > 2 && (
                        <span className="text-xs text-muted-foreground">+{content.length - 2} more</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Optimal Times */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Optimal Upload Times
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {timeAnalysis?.optimalSlots.slice(0, 4).map((slot, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Badge variant={slot.confidence === "high" ? "default" : "secondary"} className="shrink-0">
                    {slot.confidence}
                  </Badge>
                  <div className="text-sm">
                    <p className="font-medium">{slot.day}</p>
                    <p className="text-muted-foreground">{slot.timeRange}</p>
                  </div>
                </div>
              )) || <p className="text-sm text-muted-foreground">Add competitors to see optimal times</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500/20" />
                <span>Optimal upload day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-primary" />
                <span>Today</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Content Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Schedule Content for {selectedDate ? format(selectedDate, "MMM d, yyyy") : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Video title or topic"
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Any notes about this content..."
              />
            </div>
            <Button onClick={handleAddContent} className="w-full" disabled={!newTitle.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Content
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
