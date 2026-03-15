import {
  LayoutDashboard, Users, Building2, Megaphone, CheckSquare, UserCheck, Settings, Search,
  Inbox, Zap, FileText, Building, HardHat, Map, Target, UserSearch, Crosshair,
  Gavel, BarChart3, MapPin, FileSearch, BoxSelect, Sparkles,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

const mainNav = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Inbox', url: '/inbox', icon: Inbox },
  { title: 'Leads', url: '/leads', icon: Users },
  { title: 'Properties', url: '/properties', icon: Building2 },
  { title: 'Campaigns', url: '/campaigns', icon: Megaphone },
  { title: 'Automations', url: '/automations', icon: Zap },
  { title: 'Tasks', url: '/tasks', icon: CheckSquare },
  { title: 'Documents', url: '/documents', icon: FileText },
  { title: 'Vendors', url: '/vendors', icon: HardHat },
  { title: 'Buyers', url: '/buyers', icon: UserCheck },
];

const intelligenceNav = [
  { title: 'Deal Finder AI', url: '/deal-finder', icon: Sparkles },
  { title: 'Lead Finder', url: '/lead-finder', icon: Search },
  { title: 'Heat Maps', url: '/heat-map', icon: Map },
  { title: 'Deal Score', url: '/deal-score', icon: Target },
  { title: 'Skip Trace', url: '/skip-trace', icon: Crosshair },
  { title: 'Foreclosures', url: '/foreclosures', icon: Gavel },
  { title: 'Market Trends', url: '/market-trends', icon: BarChart3 },
  { title: 'Neighborhood', url: '/neighborhood', icon: MapPin },
  { title: 'Public Records', url: '/public-records', icon: FileSearch },
  { title: 'Buy Box', url: '/buy-box', icon: BoxSelect },
  { title: 'Market Intel', url: '/market-intelligence', icon: BarChart3 },
];

const bottomNav = [
  { title: 'Company', url: '/company', icon: Building },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-sidebar-accent-foreground">REI CRM</h2>
              <p className="text-[10px] text-sidebar-foreground">Wholesale & Acquisitions</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {intelligenceNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomNav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  className="hover:bg-sidebar-accent/50"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
