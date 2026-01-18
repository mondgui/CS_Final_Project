import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import api from '../utils/api'
import { format } from 'date-fns'

const statusColors = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
}

export default function Bookings() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [deleteDialog, setDeleteDialog] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-bookings', page, rowsPerPage],
    queryFn: async () => {
      const res = await api.get(`/api/admin/bookings?page=${page + 1}&limit=${rowsPerPage}`)
      return res.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (bookingId) => {
      await api.delete(`/api/admin/bookings/${bookingId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-bookings'])
      setDeleteDialog(null)
    },
  })

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">Failed to load bookings</Alert>
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bookings
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.bookings?.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.student?.name || '-'}</TableCell>
                <TableCell>{booking.teacher?.name || '-'}</TableCell>
                <TableCell>{booking.day || '-'}</TableCell>
                <TableCell>
                  {booking.startTime && booking.endTime
                    ? `${booking.startTime} - ${booking.endTime}`
                    : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={booking.status}
                    color={statusColors[booking.status] || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {booking.createdAt ? format(new Date(booking.createdAt), 'MMM dd, yyyy') : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteDialog(booking)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={data?.pagination?.total || 0}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10))
          setPage(0)
        }}
      />

      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Delete Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this booking? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteMutation.mutate(deleteDialog.id)}
            disabled={deleteMutation.isLoading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
