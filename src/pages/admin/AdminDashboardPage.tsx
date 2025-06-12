import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Activity, 
  Server, 
  Database, 
  Cloud, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  Eye,
  RefreshCw
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminDashboardMetrics, getSystemHealth, getStorageStats, logEvent } from '../../utils/api';
import { AdminDashboardMetrics, SystemHealth } from '../../types';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    
    try {
      const [metricsData, healthData, storageData] = await Promise.allSettled([
        getAdminDashboardMetrics(),
        getSystemHealth(),
        getStorageStats()
      ]);

      if (metricsData.status === 'fulfilled') {
        setMetrics(metricsData.value);
      }
      
      if (healthData.status === 'fulfilled') {
        setSystemHealth(healthData.value);
      }
      
      if (storageData.status === 'fulfilled') {
        setStorageStats(storageData.value.stats);
      }
      
      setLastUpdated(new Date());
      
      // Log admin dashboard view
      if (user) {
        await logEvent({
          action: 'admin_dashboard_view',
          userId: user.id,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRefresh = () => {
    fetchData(true);
  };

  // Prepare chart data
  const eventBreakdownData = {
    labels: metrics?.eventBreakdown.map(event => event.action.replace(/_/g, ' ')) || [],
    datasets: [
      {
        label: 'Event Count',
        data: metrics?.eventBreakdown.map(event => event.count) || [],
        backgroundColor: [
          '#4F46E5', '#7C3AED', '#EC4899', '#EF4444', '#F59E0B',
          '#10B981', '#06B6D4', '#8B5CF6', '#F97316', '#84CC16'
        ],
        borderColor: [
          '#4338CA', '#6D28D9', '#DB2777', '#DC2626', '#D97706',
          '#059669', '#0891B2', '#7C2D12', '#EA580C', '#65A30D'
        ],
        borderWidth: 1,
      },
    ],
  };

  const dailyActivityData = {
    labels: metrics?.dailyActivity.slice(-7).map(day => 
      new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Daily Events',
        data: metrics?.dailyActivity.slice(-7).map(day => day.count) || [],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const systemHealthData = {
    labels: ['Healthy', 'Unhealthy'],
    datasets: [
      {
        data: systemHealth ? [
          Object.values(systemHealth.services).filter(service => service.status === 'healthy').length,
          Object.values(systemHealth.services).filter(service => service.status === 'unhealthy').length
        ] : [0, 0],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#059669', '#DC2626'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              System analytics and monitoring
              {lastUpdated && (
                <span className="ml-2 text-sm">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            icon={<RefreshCw className="h-4 w-4 mr-1" />}
          >
            Refresh
          </Button>
        </div>

        {/* System Health Alert */}
        {systemHealth && systemHealth.overallHealth !== 'healthy' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-sm font-medium text-red-800">System Health Alert</h3>
            </div>
            <p className="text-sm text-red-700 mt-1">
              One or more services are experiencing issues. Check the system health section below.
            </p>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-md bg-blue-100 flex items-center justify-center mr-4">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Events</p>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {metrics?.overview.totalEvents.toLocaleString() || '0'}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-md bg-green-100 flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {metrics?.overview.totalUsers || '0'}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-md bg-purple-100 flex items-center justify-center mr-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Users</p>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {metrics?.overview.activeUsers || '0'}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className={`h-12 w-12 rounded-md flex items-center justify-center mr-4 ${
                  systemHealth?.overallHealth === 'healthy' 
                    ? 'bg-green-100' 
                    : 'bg-red-100'
                }`}>
                  {systemHealth?.overallHealth === 'healthy' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">System Health</p>
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {systemHealth?.overallHealth || 'Unknown'}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Breakdown */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Event Breakdown</h2>
            </CardHeader>
            <CardContent>
              {metrics?.eventBreakdown.length ? (
                <div className="h-64">
                  <Bar data={eventBreakdownData} options={barChartOptions} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No event data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Activity */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Daily Activity (Last 7 Days)</h2>
            </CardHeader>
            <CardContent>
              {metrics?.dailyActivity.length ? (
                <div className="h-64">
                  <Line data={dailyActivityData} options={chartOptions} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No activity data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Health Details */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">System Health Details</h2>
          </CardHeader>
          <CardContent>
            {systemHealth ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(systemHealth.services).map(([service, health]) => (
                  <div key={service} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      {service === 'bigquery' && <Database className="h-5 w-5 text-gray-600 mr-2" />}
                      {service === 'vertexai' && <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />}
                      {service === 'storage' && <Cloud className="h-5 w-5 text-gray-600 mr-2" />}
                      {service === 'server' && <Server className="h-5 w-5 text-gray-600 mr-2" />}
                      <span className="text-sm font-medium capitalize">{service}</span>
                    </div>
                    <Badge 
                      variant={health.status === 'healthy' ? 'success' : 'danger'}
                      className="text-xs"
                    >
                      {health.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">System health data unavailable</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity & Storage Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            </CardHeader>
            <CardContent>
              {metrics?.recentActivity.length ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {metrics.recentActivity.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-indigo-500 rounded-full mr-3"></div>
                        <div>
                          <span className="text-sm text-gray-900 capitalize">
                            {activity.action.replace(/_/g, ' ')}
                          </span>
                          <p className="text-xs text-gray-500">User: {activity.userId.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Storage Statistics */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Storage Statistics</h2>
            </CardHeader>
            <CardContent>
              {storageStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{storageStats.totalFiles}</div>
                      <div className="text-sm text-gray-500">Total Files</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(storageStats.totalSize / (1024 * 1024)).toFixed(1)}MB
                      </div>
                      <div className="text-sm text-gray-500">Total Size</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">File Types</h4>
                    <div className="space-y-1">
                      {Object.entries(storageStats.fileTypes).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="text-gray-600">{type}</span>
                          <span className="font-medium">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Storage data unavailable</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Actions */}
        {metrics?.topActions.length && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Top Actions</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.topActions.map((action, index) => (
                  <div key={action.action} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-indigo-600">{index + 1}</span>
                      </div>
                      <span className="text-sm font-medium capitalize">
                        {action.action.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {action.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;