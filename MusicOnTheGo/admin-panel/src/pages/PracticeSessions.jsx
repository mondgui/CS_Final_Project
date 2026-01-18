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
  IconButton,
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

export default function PracticeSessions() {
  const [deleteDialog, setDeleteDialog] = useState(null)
  const queryClient = useQueryClient()

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['admin-practice-sessions'],
    queryFn: async () => {
      const res = await api.get('/api/admin/practice-sessions')
      return res.data
    },
  })

  const sessions = response?.sessions || []

  const deleteMutation = useMutation({
    mutationFn: async (sessionId) => {
      await api.delete(`/api/admin/practice-sessions/${sessionId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-practice-sessions'])
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
    return <Alert severity="error">Failed to load practice sessions</Alert>
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Practice Sessions
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Minutes</TableCell>
              <TableCell>Focus</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No practice sessions found.
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.student?.name || '-'}</TableCell>
                  <TableCell>{session.minutes}</TableCell>
                  <TableCell>{session.focus || '-'}</TableCell>
                  <TableCell>
                    {session.date ? format(new Date(session.date), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {session.createdAt ? format(new Date(session.createdAt), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog(session)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Delete Practice Session</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this practice session? This action cannot be undone.
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
