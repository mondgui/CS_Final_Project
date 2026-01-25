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

export default function Resources() {
  const [deleteDialog, setDeleteDialog] = useState(null)
  const queryClient = useQueryClient()

  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['admin-resources'],
    queryFn: async () => {
      // Assuming this endpoint exists or needs to be created
      const res = await api.get('/api/resources')
      return Array.isArray(res.data) ? res.data : []
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (resourceId) => {
      await api.delete(`/api/resources/${resourceId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-resources'])
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
    return <Alert severity="error">Failed to load resources</Alert>
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Resources
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Instrument</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Uploaded By</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(resources || []).map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>{resource.title}</TableCell>
                <TableCell>
                  <Chip label={resource.fileType} size="small" />
                </TableCell>
                <TableCell>{resource.instrument || '-'}</TableCell>
                <TableCell>
                  <Chip label={resource.level} size="small" />
                </TableCell>
                <TableCell>{resource.uploadedBy?.name || '-'}</TableCell>
                <TableCell>
                  {resource.createdAt ? format(new Date(resource.createdAt), 'MMM dd, yyyy') : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteDialog(resource)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Delete Resource</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this resource? This action cannot be undone.
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
