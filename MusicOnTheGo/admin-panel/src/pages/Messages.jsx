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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import api from '../utils/api'
import { format } from 'date-fns'

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const res = await api.get('/api/admin/messages')
      return res.data
    },
  })

  const { data: conversationMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ['admin-conversation-messages', selectedConversation?.roomId],
    queryFn: async () => {
      const res = await api.get(`/api/admin/messages/${selectedConversation.roomId}`)
      return res.data
    },
    enabled: !!selectedConversation,
  })

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">Failed to load conversations</Alert>
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Participants</TableCell>
              <TableCell>Last Message</TableCell>
              <TableCell>Unread</TableCell>
              <TableCell>Total Messages</TableCell>
              <TableCell>Last Activity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.conversations?.map((conversation) => (
              <TableRow
                key={conversation.roomId}
                hover
                onClick={() => setSelectedConversation(conversation)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Chip 
                          label={conversation.participant1?.role || 'Unknown'} 
                          size="small" 
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {conversation.participant1?.name || '-'}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                        <Chip 
                          label={conversation.participant2?.role || 'Unknown'} 
                          size="small" 
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {conversation.participant2?.name || '-'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ maxWidth: 400 }}>
                  <Typography variant="body2" noWrap>
                    {conversation.lastMessage?.text || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {conversation.unreadCount > 0 ? (
                    <Chip
                      label={conversation.unreadCount}
                      color="error"
                      size="small"
                    />
                  ) : (
                    <Typography variant="body2" color="textSecondary">-</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{conversation.totalMessages}</Typography>
                </TableCell>
                <TableCell>
                  {conversation.lastMessageAt
                    ? format(new Date(conversation.lastMessageAt), 'MMM dd, yyyy HH:mm')
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Conversation Details Dialog */}
      <Dialog
        open={!!selectedConversation}
        onClose={() => setSelectedConversation(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Conversation between {selectedConversation?.participant1?.name} and {selectedConversation?.participant2?.name}
        </DialogTitle>
        <DialogContent>
          {messagesLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
              {conversationMessages?.map((message) => {
                const isFromParticipant1 = message.senderId === selectedConversation?.participant1?.id;
                return (
                  <Box
                    key={message.id}
                    sx={{
                      mb: 2,
                      display: 'flex',
                      justifyContent: isFromParticipant1 ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: isFromParticipant1 ? '#e3f2fd' : '#f1f8e9',
                        borderLeft: isFromParticipant1 ? '4px solid #1976d2' : '4px solid #66bb6a',
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Chip
                          label={message.sender?.role || 'Unknown'}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {message.sender?.name || '-'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {format(new Date(message.createdAt), 'MMM dd, HH:mm')}
                        </Typography>
                      </Box>
                      <Typography variant="body2" whiteSpace="pre-wrap">
                        {message.text}
                      </Typography>
                      {message.read && (
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                          ✓ Read
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedConversation(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
