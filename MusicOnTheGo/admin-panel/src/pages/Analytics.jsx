import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material'
import api from '../utils/api'

export default function Analytics() {
  const [days, setDays] = useState(30)

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-analytics-usage', days],
    queryFn: async () => {
      const res = await api.get(`/api/admin/analytics/usage?days=${days}`)
      return res.data
    },
  })

  const byName = data?.byName ?? []
  const mostUsed = byName.slice(0, 5)
  const leastUsed = byName.length > 5 ? byName.slice(-5).reverse() : []

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
        <Typography variant="h4">App usage</Typography>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={days}
            label="Period"
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Screens and features are tracked when users open them in the mobile app. Use this to polish high-usage areas and consider simplifying or removing low-usage ones in future releases.
      </Alert>

      {isLoading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error">Failed to load usage data</Alert>
      )}

      {!isLoading && !error && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            All screens / features (by views)
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Screen / feature</TableCell>
                  <TableCell align="right">Views</TableCell>
                  <TableCell align="right">Unique users</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {byName.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No usage data yet. Data appears as users use the mobile app.
                    </TableCell>
                  </TableRow>
                ) : (
                  byName.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {row.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{row.views}</TableCell>
                      <TableCell align="right">{row.uniqueUsers ?? row.unique_users ?? '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {byName.length > 0 && (
            <Box display="flex" gap={2} flexWrap="wrap">
              <Paper sx={{ p: 2, flex: '1 1 200px' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Most used (top 5)
                </Typography>
                {mostUsed.map((r, i) => (
                  <Chip
                    key={r.name}
                    label={`${r.name} (${r.views})`}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                    color="primary"
                    variant={i === 0 ? 'filled' : 'outlined'}
                  />
                ))}
              </Paper>
              <Paper sx={{ p: 2, flex: '1 1 200px' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Least used (bottom 5)
                </Typography>
                {leastUsed.length === 0 ? (
                  <Typography variant="body2">N/A (fewer than 6 items)</Typography>
                ) : (
                  leastUsed.map((r) => (
                    <Chip
                      key={r.name}
                      label={`${r.name} (${r.views})`}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                      variant="outlined"
                    />
                  ))
                )}
              </Paper>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
