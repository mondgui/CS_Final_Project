import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
} from '@mui/material'
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Message as MessageIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  FitnessCenter as FitnessIcon,
  Folder as FolderIcon,
  Forum as ForumIcon,
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import api from '../utils/api'
import { format } from 'date-fns'

const COLORS = ['#FF6A5C', '#4CAF50', '#FF9800']

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('30days')
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats', timeRange],
    queryFn: async () => {
      const res = await api.get(`/api/admin/stats?timeRange=${timeRange}`)
      return res.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  const metrics = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <PeopleIcon fontSize="large" color="primary" />,
      color: '#1976d2',
    },
    {
      title: 'Students',
      value: stats?.students || 0,
      icon: <SchoolIcon fontSize="large" color="primary" />,
      color: '#1976d2',
    },
    {
      title: 'Teachers',
      value: stats?.teachers || 0,
      icon: <PersonIcon fontSize="large" color="primary" />,
      color: '#1976d2',
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: <CalendarIcon fontSize="large" color="secondary" />,
      color: '#ed6c02',
    },
    {
      title: 'Pending Bookings',
      value: stats?.pendingBookings || 0,
      icon: <PendingIcon fontSize="large" color="warning" />,
      color: '#ed6c02',
    },
    {
      title: 'Approved Bookings',
      value: stats?.approvedBookings || 0,
      icon: <CheckCircleIcon fontSize="large" color="success" />,
      color: '#2e7d32',
    },
    {
      title: 'Messages',
      value: stats?.totalMessages || 0,
      icon: <MessageIcon fontSize="large" color="primary" />,
      color: '#1976d2',
    },
    {
      title: 'Practice Sessions',
      value: stats?.totalPracticeSessions || 0,
      icon: <FitnessIcon fontSize="large" color="primary" />,
      color: '#1976d2',
    },
    {
      title: 'Resources',
      value: stats?.totalResources || 0,
      icon: <FolderIcon fontSize="large" color="primary" />,
      color: '#1976d2',
    },
    {
      title: 'Community Posts',
      value: stats?.totalCommunityPosts || 0,
      icon: <ForumIcon fontSize="large" color="primary" />,
      color: '#1976d2',
    },
  ]

  const bookingStatusData = [
    { name: 'Approved', value: stats?.approvedBookings || 0 },
    { name: 'Pending', value: stats?.pendingBookings || 0 },
    { name: 'Rejected', value: (stats?.totalBookings || 0) - (stats?.approvedBookings || 0) - (stats?.pendingBookings || 0) },
  ]

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Dashboard</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="90days">Last 90 Days</MenuItem>
            <MenuItem value="6months">Last 6 Months</MenuItem>
            <MenuItem value="1year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {metric.title}
                    </Typography>
                    <Typography variant="h4">{metric.value}</Typography>
                  </Box>
                  {metric.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Growth
            </Typography>
            {stats?.userGrowthData && stats.userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#FF6A5C"
                    fill="#FF6A5C"
                    fillOpacity={0.6}
                    name="New Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <Typography color="textSecondary">
                  No user growth data available for the selected time range.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Booking Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent, value }) => value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => `${entry.payload.name}: ${entry.payload.value}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {stats?.activityData && stats.activityData.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Platform Activity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#FF6A5C"
                    name="Bookings"
                  />
                  <Line
                    type="monotone"
                    dataKey="messages"
                    stroke="#1976d2"
                    name="Messages"
                  />
                  <Line
                    type="monotone"
                    dataKey="practiceSessions"
                    stroke="#2e7d32"
                    name="Practice Sessions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* User Role Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Roles
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Students', value: stats?.students || 0 },
                    { name: 'Teachers', value: stats?.teachers || 0 },
                    { name: 'Admins', value: (stats?.totalUsers || 0) - (stats?.students || 0) - (stats?.teachers || 0) },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent, value }) => value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Students', value: stats?.students || 0 },
                    { name: 'Teachers', value: stats?.teachers || 0 },
                    { name: 'Admins', value: (stats?.totalUsers || 0) - (stats?.students || 0) - (stats?.teachers || 0) },
                  ].map((entry, index) => (
                    <Cell key={`role-cell-${index}`} fill={['#4CAF50', '#FF9800', '#9C27B0'][index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => `${entry.payload.name}: ${entry.payload.value}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Locations Bar Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Cities by User Count
            </Typography>
            {stats?.topLocations && stats.topLocations.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topLocations.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="location" 
                    type="category"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#1976d2" name="Users">
                    <LabelList dataKey="count" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <Typography color="textSecondary">
                  No location data available. Users need to set their location in their profile.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Top Instruments Bar Chart */}
        {stats?.topInstruments && stats.topInstruments.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Instruments
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topInstruments.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="instrument" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#FF6A5C" name="Users">
                    <LabelList dataKey="count" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Onboarding Funnel */}
        {stats?.onboardingFunnel && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Onboarding Funnel
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { stage: 'Signed Up', count: stats.onboardingFunnel.signedUp || 0 },
                  { stage: 'Completed Profile', count: stats.onboardingFunnel.completedProfile || 0 },
                  { stage: 'First Booking', count: stats.onboardingFunnel.firstBooking || 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#9C27B0" name="Users">
                    <LabelList dataKey="count" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
