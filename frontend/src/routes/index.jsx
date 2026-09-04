import { createFileRoute } from "@tanstack/react-router";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

import StatCard from "../components/dashboard/StatCard";
import Chart from "../components/dashboard/Chart";
import Activity from "../components/dashboard/Activity";
import ProductTable from "../components/dashboard/ProductTable";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="Revenus" value="48 924 €" />
            <StatCard title="Clients" value="2 845" />
            <StatCard title="Commandes" value="1 247" />
            <StatCard title="Conversion" value="3.84 %" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Chart />
            </div>

            <Activity />
          </div>

          <ProductTable />
        </main>
      </div>
    </div>
  );
}