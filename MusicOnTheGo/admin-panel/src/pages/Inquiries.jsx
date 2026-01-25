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
  Chip,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'
import api from '../utils/api'
import { format } from 'date-fns'

export default function Inquiries() {
  const { data: inquiries, isLoading, error } = useQuery({
    queryKey: ['admin-inquiries'],
    queryFn: async () => {
      const res = await api.get('/api/admin/inquiries')
      return res.data
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
    return <Alert severity="error">Failed to load inquiries</Alert>
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Inquiries
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Instrument</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Lesson Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(inquiries || []).map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell>{inquiry.student?.name || '-'}</TableCell>
                <TableCell>{inquiry.teacher?.name || '-'}</TableCell>
                <TableCell>{inquiry.instrument || '-'}</TableCell>
                <TableCell>{inquiry.level || '-'}</TableCell>
                <TableCell>{inquiry.lessonType || '-'}</TableCell>
                <TableCell>
                  <Chip label={inquiry.status} size="small" />
                </TableCell>
                <TableCell>
                  {inquiry.createdAt ? format(new Date(inquiry.createdAt), 'MMM dd, yyyy') : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
