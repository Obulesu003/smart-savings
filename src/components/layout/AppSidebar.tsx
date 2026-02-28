
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    LayoutDashboard,
    Wallet,
    CreditCard,
    Target,
    BarChart,
    LineChart,
    Settings,
    MoreHorizontal,
    LogOut,
    TrendingUp,
    PieChart,
    GraduationCap,
    Sparkles,
    Bot
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Link, useLocation } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
    const { user, signOut } = useAuth()
    const location = useLocation()

    const items = [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "AI Smart Plan",
            url: "/smart-plan",
            icon: Sparkles,
        },
        {
            title: "AI Assistant",
            url: "/assistant",
            icon: Bot,
        },
        {
            title: "Income",
            url: "/income",
            icon: TrendingUp,
        },
        {
            title: "Expenses",
            url: "/expenses",
            icon: CreditCard,
        },
        {
            title: "Budgets",
            url: "/budgets",
            icon: PieChart,
        },
        {
            title: "Goals",
            url: "/goals",
            icon: Target,
        },
        {
            title: "Reports",
            url: "/reports",
            icon: BarChart,
        },
        {
            title: "Predictions",
            url: "/predictions",
            icon: LineChart,
        },
        {
            title: "Settings",
            url: "/settings",
            icon: Settings,
        },
        {
            title: "AI Learning",
            url: "/learning",
            icon: GraduationCap,
        },
    ]

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex h-12 w-full items-center gap-2 group-data-[collapsible=icon]:justify-center px-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <TrendingUp className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none transition-all group-data-[collapsible=icon]:hidden">
                        <span className="font-semibold">WealthPlanner</span>
                        <span className="">Smart Savings</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={location.pathname === item.url} tooltip={item.title}>
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center justify-between p-2 group-data-[collapsible=icon]:p-0">
                            <div className="group-data-[collapsible=icon]:hidden w-full">
                                <ModeToggle />
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <div className="flex h-8 w-8 rounded-lg items-center justify-center bg-muted">
                                        <span className="text-xs font-medium">{user?.email?.substring(0, 2).toUpperCase()}</span>
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user?.user_metadata?.full_name || 'User'}</span>
                                        <span className="truncate text-xs">{user?.email}</span>
                                    </div>
                                    <MoreHorizontal className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <div className="flex h-8 w-8 rounded-lg items-center justify-center bg-muted">
                                            <span className="text-xs font-medium">{user?.email?.substring(0, 2).toUpperCase()}</span>
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user?.user_metadata?.full_name || 'User'}</span>
                                            <span className="truncate text-xs">{user?.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/settings" className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
