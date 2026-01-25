import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { Send as SendIcon } from '@mui/icons-material'
import api from '../utils/api'

export default function BulkMessaging() {
  const [message, setMessage] = useState('')
  const [targetType, setTargetType] = useState('all')
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const queryClient = useQueryClient()

  const { data: users } = useQuery({
    queryKey: ['admin-users-for-messaging'],
    queryFn: async () => {
      const res = await api.get('/api/admin/users?limit=1000')
      return res.data.users || []
    },
  })

  const sendMutation = useMutation({
    mutationFn: async ({ userIds, message }) => {
      await api.post('/api/admin/bulk-message', { userIds, message })
    },
    onSuccess: () => {
      setMessage('')
      setSelectedUserIds([])
      alert('Messages sent successfully!')
    },
  })

  const handleSend = () => {
    if (!message.trim()) {
      alert('Please enter a message')
      return
    }

    let userIds = []
    
    if (targetType === 'all') {
      userIds = (users || []).map(u => u.id)
    } else if (targetType === 'students') {
      userIds = (users || []).filter(u => u.role === 'student').map(u => u.id)
    } else if (targetType === 'teachers') {
      userIds = (users || []).filter(u => u.role === 'teacher').map(u => u.id)
    } else if (targetType === 'selected') {
      userIds = selectedUserIds
    }

    if (userIds.length === 0) {
      alert('No users selected')
      return
    }

    sendMutation.mutate({ userIds, message })
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bulk Messaging
      </Typography>

      <Paper sx={{ p: 3 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Send To</InputLabel>
          <Select
            value={targetType}
            label="Send To"
            onChange={(e) => setTargetType(e.target.value)}
          >
            <MenuItem value="all">All Users</MenuItem>
            <MenuItem value="students">All Students</MenuItem>
            <MenuItem value="teachers">All Teachers</MenuItem>
            <MenuItem value="selected">Selected Users</MenuItem>
          </Select>
        </FormControl>

        {targetType === 'selected' && (
          <Box sx={{ mb: 3, maxHeight: 300, overflow: 'auto' }}>
            <List>
              {(users || []).map((user) => (
                <ListItem key={user.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedUserIds.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUserIds([...selectedUserIds, user.id])
                          } else {
                            setSelectedUserIds(selectedUserIds.filter(id => id !== user.id))
                          }
                        }}
                      />
                    }
                    label={`${user.name} (${user.email}) - ${user.role}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <TextField
          fullWidth
          multiline
          rows={6}
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleSend}
          disabled={sendMutation.isLoading}
        >
          {sendMutation.isLoading ? 'Sending...' : 'Send Messages'}
        </Button>

        {targetType !== 'selected' && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This will send to {targetType === 'all' ? 'all users' : targetType === 'students' ? 'all students' : 'all teachers'} 
            ({(users || []).filter(u => targetType === 'all' || u.role === targetType.slice(0, -1)).length} users)
          </Typography>
        )}
      </Paper>
    </Box>
  )
}
