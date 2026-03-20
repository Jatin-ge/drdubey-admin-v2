import {
  Calendar,
  IndianRupee,
  TrendingUp,
  Users
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

import { getAppoinments } from "@/actions/get-appoinments";
import { getGraphRevenue } from "@/actions/get-graph-revenue";
import { getLastMonthLeads } from "@/actions/get-leads";
import { revenue } from "@/actions/get-sales";
import { CityManagement } from "@/components/admin/dashboard/city-management";
import { CalendarDateRangePicker } from "@/components/admin/dashboard/date-range-picket";
import { RecentSales } from "@/components/admin/dashboard/recent-sales";
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DownloadReport } from "./DownloadReport";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

export const DashboardPage = async () => {
  const TotalAppointments = await getAppoinments();
  const TotalSales = await revenue();
  const LeadsLastMonth = await getLastMonthLeads();
  const graphRevenue = await getGraphRevenue();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <div className="flex items-center space-x-4">
          <CalendarDateRangePicker />
          <CityManagement />
          <DownloadReport
            totalRevenue={TotalSales}
            totalAppointments={TotalAppointments}
            newLeads={LeadsLastMonth}
            totalPatients={2345}
            revenueByMonth={graphRevenue}
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="overview" className="text-base">Overview</TabsTrigger>
          <TabsTrigger value="analytics" disabled className="text-base">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin">
              <Card className="group hover:bg-gray-50 transition-all duration-300 cursor-pointer border-l-4 border-l-primary relative overflow-hidden">
                <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/100 rounded-lg transition-all duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                  <IndianRupee className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold group-hover:text-primary transition-colors duration-300">₹{TotalSales}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total earnings
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/appointment">
              <Card className="group hover:bg-gray-50 transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500 relative overflow-hidden">
                <div className="absolute inset-0 border-2 border-blue-500/0 group-hover:border-blue-500/100 rounded-lg transition-all duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Appointments
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold group-hover:text-blue-500 transition-colors duration-300">{TotalAppointments}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Booked this week
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/patients">
              <Card className="group hover:bg-gray-50 transition-all duration-300 cursor-pointer border-l-4 border-l-green-500 relative overflow-hidden">
                <div className="absolute inset-0 border-2 border-green-500/0 group-hover:border-green-500/100 rounded-lg transition-all duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    New Leads
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold group-hover:text-green-500 transition-colors duration-300">+{LeadsLastMonth}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last 30 days
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/patients">
              <Card className="group hover:bg-gray-50 transition-all duration-300 cursor-pointer border-l-4 border-l-purple-500 relative overflow-hidden">
                <div className="absolute inset-0 border-2 border-purple-500/0 group-hover:border-purple-500/100 rounded-lg transition-all duration-300"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Patients
                  </CardTitle>
                  <Users className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform duration-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold group-hover:text-purple-500 transition-colors duration-300">2,345</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lifetime patients
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-7">
            <RevenueChart data={graphRevenue} />

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary">
                  Today&apos;s Appointments
                </CardTitle>
                <CardDescription>
                  Upcoming appointments for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
