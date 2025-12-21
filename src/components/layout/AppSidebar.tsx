import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Youtube,
  BookOpen,
  Users,
  Image,
  Video,
  ImageIcon,
  ListMusic,
  Shirt,
  FileText,
  Upload,
  Plug,
  ShieldCheck,
  LogOut,
  Sparkles,
  Lightbulb,
  BarChart2,
  ChevronLeft,
  BarChart3,
  Search,
  Tv,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const userMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "YouTube Analysis", url: "/youtube-analysis", icon: Youtube },
  { title: "Stories", url: "/stories", icon: BookOpen },
  { title: "Characters", url: "/characters", icon: Users },
  { title: "Visuals", url: "/visuals", icon: Image },
  { title: "Videos", url: "/videos", icon: Video },
  { title: "Thumbnails", url: "/thumbnails", icon: ImageIcon },
  { title: "Playlists", url: "/playlists", icon: ListMusic },
  { title: "Merch", url: "/merch", icon: Shirt },
];

const workflowItems = [
  { title: "Drafts", url: "/drafts", icon: FileText },
  { title: "Publishing", url: "/publishing", icon: Upload },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Integrations", url: "/integrations", icon: Plug },
  { title: "YouTube Channels", url: "/youtube-channels", icon: Tv },
  { title: "Keyword Research", url: "/keyword-research", icon: Search },
  { title: "Competitors", url: "/competitors", icon: Users },
  { title: "Competitor Insights", url: "/competitor-insights", icon: Lightbulb },
  { title: "Performance", url: "/performance-comparison", icon: BarChart2 },
];

const adminItems = [
  { title: "Admin Review", url: "/admin-review", icon: ShieldCheck },
];

export function AppSidebar() {
  const location = useLocation();
  const { role, logout } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const MenuItem = ({ item }: { item: typeof userMenuItems[0] }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link
          to={item.url}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
            isActive(item.url)
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="font-medium">{item.title}</span>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar
      className={cn(
        "border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold text-sidebar-foreground">
                  Story Studio
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {role} Mode
                </span>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={toggleSidebar}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                collapsed && "rotate-180"
              )}
            />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Create
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {userMenuItems.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          {!collapsed && (
            <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Workflow
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {workflowItems.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {role === "admin" && (
          <SidebarGroup className="mt-6">
            {!collapsed && (
              <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Admin
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {adminItems.map((item) => (
                  <MenuItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
            collapsed && "justify-center"
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Log Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
