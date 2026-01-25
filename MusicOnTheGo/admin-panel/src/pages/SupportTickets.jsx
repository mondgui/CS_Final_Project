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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
} from '@mui/material'
import { Delete as DeleteIcon, Reply as ReplyIcon, CheckCircle as CheckCircleIcon, Close as CloseIcon } from '@mui/icons-material'
import api from '../utils/api'
import { format } from 'date-fns'

const statusColors = {
  open: 'error',
  replied: 'warning',
  resolved: 'success',
  closed: 'default',
}

export default function SupportTickets() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyDialog, setReplyDialog] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-support-tickets', page, rowsPerPage, statusFilter],
    queryFn: async () => {
      const params = { page: page + 1, limit: rowsPerPage }
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      const res = await api.get('/api/support/admin/support-tickets', { params })
      return res.data
    },
  })

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, reply }) => {
      const res = await api.put(`/api/support/admin/support-tickets/${ticketId}/reply`, { reply })
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['admin-support-tickets'])
      // Update selected ticket with new reply
      if (selectedTicket) {
        setSelectedTicket(data.ticket)
      }
      setReplyDialog(false)
      setReplyText('')
      const message = data.emailSent 
        ? 'Reply sent successfully and email notification sent to user!' 
        : 'Reply sent successfully, but email notification failed.'
      alert(message)
    },
    onError: (error) => {
      console.error('Reply mutation error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reply'
      alert(`Error: ${errorMessage}`)
    },
  })

  const statusMutation = useMutation({
    mutationFn: async ({ ticketId, status }) => {
      const res = await api.put(`/api/support/admin/support-tickets/${ticketId}/status`, { status })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-support-tickets'])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (ticketId) => {
      await api.delete(`/api/support/admin/support-tickets/${ticketId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-support-tickets'])
      setSelectedTicket(null)
    },
  })

  const handleReply = () => {
    if (!replyText.trim()) {
      alert('Please enter a reply message')
      return
    }
    replyMutation.mutate({ ticketId: selectedTicket.id, reply: replyText })
  }

  const handleStatusChange = (ticketId, status) => {
    statusMutation.mutate({ ticketId, status })
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">Failed to load support tickets</Alert>
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Support Tickets</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(0)
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="replied">Replied</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.tickets?.map((ticket) => (
              <TableRow
                key={ticket.id}
                hover
                onClick={() => setSelectedTicket(ticket)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  {ticket.user?.name || ticket.name}
                  {ticket.user && (
                    <Chip label={ticket.user.role} size="small" sx={{ ml: 1 }} />
                  )}
                </TableCell>
                <TableCell>{ticket.email}</TableCell>
                <TableCell>{ticket.queryType || '-'}</TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography variant="body2" noWrap>
                    {ticket.subject}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={ticket.status}
                    color={statusColors[ticket.status] || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM dd, yyyy') : '-'}
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      setSelectedTicket(ticket)
                      setReplyDialog(true)
                    }}
                  >
                    <ReplyIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleStatusChange(ticket.id, 'resolved')}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => deleteMutation.mutate(ticket.id)}
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

      {/* Ticket Details Dialog */}
      <Dialog
        open={!!selectedTicket && !replyDialog}
        onClose={() => setSelectedTicket(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Support Ticket #{selectedTicket?.id?.substring(0, 8)}
          <Chip
            label={selectedTicket?.status}
            color={statusColors[selectedTicket?.status] || 'default'}
            size="small"
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>User:</strong> {selectedTicket.user?.name || selectedTicket.name} ({selectedTicket.email})
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Type:</strong> {selectedTicket.queryType}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Subject:</strong> {selectedTicket.subject}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Created:</strong> {selectedTicket.createdAt ? format(new Date(selectedTicket.createdAt), 'PPP p') : '-'}
              </Typography>
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Message:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="body2" whiteSpace="pre-wrap">
                    {selectedTicket.message}
                  </Typography>
                </Paper>
              </Box>
              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Admin Replies:
                  </Typography>
                  {selectedTicket.replies.map((reply) => (
                    <Box key={reply.id} sx={{ mb: 2 }}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          bgcolor: '#1976d2',
                          color: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        <Typography variant="body2" whiteSpace="pre-wrap" sx={{ color: 'white' }}>
                          {reply.reply}
                        </Typography>
                      </Paper>
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                        {reply.admin?.name || 'Admin'} - {format(new Date(reply.createdAt), 'PPP p')}
                        {reply.emailSent && ' • Email sent'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTicket(null)}>Close</Button>
          <Button
            color="primary"
            variant="outlined"
            onClick={() => {
              setReplyDialog(true)
            }}
          >
            Reply
          </Button>
          <Button
            color="success"
            variant="outlined"
            onClick={() => {
              handleStatusChange(selectedTicket.id, 'resolved')
              setSelectedTicket(null)
            }}
          >
            Mark Resolved
          </Button>
          <Button
            color="error"
            variant="outlined"
            onClick={() => {
              if (confirm('Are you sure you want to delete this ticket?')) {
                deleteMutation.mutate(selectedTicket.id)
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog
        open={replyDialog}
        onClose={() => {
          setReplyDialog(false)
          setReplyText('')
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reply to Support Ticket</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Reply Message"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Enter your reply to the user..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setReplyDialog(false)
            setReplyText('')
          }}>
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleReply}
            disabled={replyMutation.isLoading}
          >
            {replyMutation.isLoading ? 'Sending...' : 'Send Reply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
