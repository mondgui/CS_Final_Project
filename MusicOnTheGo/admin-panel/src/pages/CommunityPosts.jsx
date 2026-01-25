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

export default function CommunityPosts() {
  const [deleteDialog, setDeleteDialog] = useState(null)
  const queryClient = useQueryClient()

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['admin-community-posts'],
    queryFn: async () => {
      const res = await api.get('/api/admin/community-posts')
      return res.data
    },
  })

  const posts = response?.posts || []

  const deleteMutation = useMutation({
    mutationFn: async (postId) => {
      await api.delete(`/api/admin/community-posts/${postId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-community-posts'])
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
    return <Alert severity="error">Failed to load community posts</Alert>
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Community Posts
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Author</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Instrument</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Likes</TableCell>
              <TableCell>Comments</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No community posts found.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>{post.author?.name || '-'}</TableCell>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{post.instrument || '-'}</TableCell>
                  <TableCell>
                    <Chip label={post.level} size="small" />
                  </TableCell>
                  <TableCell>{post.likeCount || 0}</TableCell>
                  <TableCell>{post.commentCount || 0}</TableCell>
                  <TableCell>
                    {post.createdAt ? format(new Date(post.createdAt), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog(post)}
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
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be undone.
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
