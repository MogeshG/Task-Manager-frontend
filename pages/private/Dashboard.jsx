import { useEffect, useState } from "react";
import axiosConfig from "../../configs/AxiosConfig";
import { Card, Spin } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#94a3b8", "#f59e0b", "#10b981"];

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axiosConfig.get("/api/tasks/analytics");
      setAnalytics(res.data.analytics);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin size="large" />;

  const pieData = [
    { name: "Not Started", value: analytics.statusDistribution.notStarted },
    { name: "In Progress", value: analytics.statusDistribution.inProgress },
    { name: "Done", value: analytics.statusDistribution.done },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-scroll h-full">
      {/* STAT CARDS */}
      <div className="grid md:grid-cols-4 gap-5">
        <StatCard title="Total Tasks" value={analytics.total} />
        <StatCard title="Completed" value={analytics.completed} />
        <StatCard title="Pending" value={analytics.pending} />
        <StatCard title="Overdue" value={analytics.overdue} danger />
      </div>

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-5">
        <Card title="Task Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label={({ name, value }) => `${name} (${value})`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Weekly Productivity">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.weeklyCompletion}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="completed" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, danger }) => (
  <Card>
    <div className="text-sm text-gray-500">{title}</div>
    <div className={`text-3xl font-bold ${danger ? "text-red-500" : "text-gray-800"}`}>{value}</div>
  </Card>
);

export default Dashboard;
