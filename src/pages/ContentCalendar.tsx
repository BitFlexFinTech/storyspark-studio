import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useScheduledContent, useCreateScheduledContent, useDeleteScheduledContent } from "@/hooks/useContentCalendar";
import { useUploadTimeAnalysis } from "@/hooks/useUploadTimeAnalysis";
import { useAudienceTimeAnalysis } from "@/hooks/useAudienceTimeAnalysis";
import { ChevronLeft, ChevronRight, Plus, Clock, Sparkles, ChevronDown, Lightbulb, Calendar as CalendarIcon, Zap } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addDays, startOfWeek } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function ContentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(true);
  const [isApplyAIOpen, setIsApplyAIOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("14:00");
  const [newNotes, setNewNotes] = useState("");

  const { data: scheduledContent = [] } = useScheduledContent(currentMonth);
  const { data: timeAnalysis } = useUploadTimeAnalysis();
  const { data: audienceAnalysis, isLoading: audienceLoading } = useAudienceTimeAnalysis();
  const createContent = useCreateScheduledContent();

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

  const getHeatmapValue = (day: string, hour: number) => {
    if (!audienceAnalysis?.heatmap) return 0;
    const entry = audienceAnalysis.heatmap.find((h) => h.day === day && h.hour === hour);
    return entry?.value || 0;
  };

  const getHeatmapColor = (value: number) => {
    if (value >= 80) return "bg-green-600";
    if (value >= 60) return "bg-green-500";
    if (value >= 40) return "bg-green-400";
    if (value >= 20) return "bg-green-300";
    if (value > 0) return "bg-green-200";
    return "bg-muted";
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

  const handleApplyAISchedule = () => {
    if (!audienceAnalysis?.weeklyPlan || audienceAnalysis.weeklyPlan.length === 0) {
      toast.error("No AI schedule available");
      return;
    }

    const nextMonday = startOfWeek(addDays(new Date(), 7), { weekStartsOn: 1 });
    
    audienceAnalysis.weeklyPlan.slice(0, 4).forEach((slot, index) => {
      const dayIndex = DAYS.findIndex((d) => d === slot.day.slice(0, 3)) || 0;
      const scheduledDate = addDays(nextMonday, dayIndex);
      
      createContent.mutate(
        {
          title: `AI Scheduled Content ${index + 1}`,
          scheduled_date: format(scheduledDate, "yyyy-MM-dd"),
          scheduled_time: slot.time,
          notes: `Priority: ${slot.priority} - Auto-scheduled by AI`,
          suggested_by_ai: true,
        },
        {
          onSuccess: () => {
            if (index === Math.min(3, audienceAnalysis.weeklyPlan.length - 1)) {
              toast.success("AI schedule applied!");
              setIsApplyAIOpen(false);
            }
          },
          onError: (err) => toast.error(err.message),
        }
      );
    });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Content Calendar"
        description="Plan and schedule your content with AI-powered optimal upload times"
      />

      <div className="space-y-6">
        {/* Audience Analytics Heatmap */}
        <Collapsible open={isHeatmapOpen} onOpenChange={setIsHeatmapOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Audience Analytics
                  </CardTitle>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isHeatmapOpen && "rotate-180")} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {audienceLoading ? (
                  <Skeleton className="h-48" />
                ) : audienceAnalysis ? (
                  <div className="grid lg:grid-cols-4 gap-6">
                    {/* Heatmap Grid */}
                    <div className="lg:col-span-3 overflow-x-auto">
                      <div className="min-w-[600px]">
                        <div className="flex">
                          <div className="w-12" />
                          {HOURS.map((hour) => (
                            <div key={hour} className="flex-1 text-center text-xs text-muted-foreground">
                              {hour % 3 === 0 ? `${hour}:00` : ""}
                            </div>
                          ))}
                        </div>
                        <TooltipProvider>
                          {DAYS.map((day) => (
                            <div key={day} className="flex items-center">
                              <div className="w-12 text-xs font-medium">{day}</div>
                              {HOURS.map((hour) => {
                                const value = getHeatmapValue(day, hour);
                                return (
                                  <Tooltip key={hour}>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={cn(
                                          "flex-1 h-6 m-0.5 rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-primary",
                                          getHeatmapColor(value)
                                        )}
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">
                                        {day} {hour}:00 - Activity: {value}%
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          ))}
                        </TooltipProvider>
                        <div className="flex items-center justify-center gap-4 mt-4">
                          <span className="text-xs text-muted-foreground">Low</span>
                          <div className="flex gap-1">
                            <div className="w-4 h-4 rounded bg-muted" />
                            <div className="w-4 h-4 rounded bg-green-200" />
                            <div className="w-4 h-4 rounded bg-green-300" />
                            <div className="w-4 h-4 rounded bg-green-400" />
                            <div className="w-4 h-4 rounded bg-green-500" />
                            <div className="w-4 h-4 rounded bg-green-600" />
                          </div>
                          <span className="text-xs text-muted-foreground">High</span>
                        </div>
                      </div>
                    </div>

                    {/* Peak Days & Hours */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Peak Days</h4>
                        <div className="space-y-2">
                          {audienceAnalysis.peakDays.slice(0, 3).map((peak, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span>{peak.day}</span>
                              <Badge variant={i === 0 ? "default" : "secondary"}>
                                {peak.activityIndex}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Peak Hours</h4>
                        <div className="space-y-2">
                          {audienceAnalysis.peakHours.slice(0, 3).map((peak, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span>{peak.hour}:00</span>
                              <Badge variant={i === 0 ? "default" : "secondary"}>
                                {peak.activityIndex}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button onClick={() => setIsApplyAIOpen(true)} className="w-full" size="sm">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Apply AI Schedule
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Connect your YouTube channel to see audience analytics
                  </p>
                )}

                {/* Insights */}
                {audienceAnalysis?.insights && audienceAnalysis.insights.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      AI Insights
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {audienceAnalysis.insights.slice(0, 4).map((insight, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm">
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

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
                {DAYS.map((day) => (
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
                      className={cn(
                        "min-h-24 p-2 rounded-lg border text-left transition-colors",
                        !isSameMonth(day, currentMonth) && "opacity-40",
                        isToday && "border-primary",
                        isOptimal && "bg-green-500/10",
                        "hover:bg-accent"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className={cn("text-sm font-medium", isToday && "text-primary")}>
                          {format(day, "d")}
                        </span>
                        {isOptimal && <Sparkles className="h-3 w-3 text-green-500" />}
                      </div>
                      <div className="mt-1 space-y-1">
                        {content.slice(0, 2).map((c) => (
                          <div
                            key={c.id}
                            className={cn(
                              "text-xs p-1 rounded truncate",
                              c.suggested_by_ai
                                ? "bg-blue-500/20 text-blue-600"
                                : "bg-primary/20 text-primary"
                            )}
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

          {/* Optimal Times & Legend */}
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
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500/20" />
                  <span>AI-suggested slot</span>
                </div>
              </CardContent>
            </Card>
          </div>
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

      {/* Apply AI Schedule Dialog */}
      <Dialog open={isApplyAIOpen} onOpenChange={setIsApplyAIOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Apply AI Schedule
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Based on your audience activity, here are the optimal upload slots for next week:
            </p>
            <div className="space-y-2">
              {audienceAnalysis?.weeklyPlan.slice(0, 4).map((slot, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{slot.day}</span>
                    <span className="text-muted-foreground">{slot.time}</span>
                  </div>
                  <Badge variant={slot.priority === "high" ? "default" : "secondary"}>
                    {slot.priority}
                  </Badge>
                </div>
              ))}
            </div>
            <Button onClick={handleApplyAISchedule} className="w-full" disabled={createContent.isPending}>
              <Sparkles className="h-4 w-4 mr-2" />
              Create {Math.min(4, audienceAnalysis?.weeklyPlan.length || 0)} Scheduled Entries
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
