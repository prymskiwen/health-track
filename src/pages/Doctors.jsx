import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import DoctorForm from '../components/forms/DoctorForm'
import ViewToggle from '../components/common/ViewToggle'
import { useDoctors } from '../hooks/useDoctors'
import { useAuth } from '../context/AuthContext'

export default function Doctors() {
  const { userRole } = useAuth()
  const {
    doctors,
    loading,
    createDoctor,
    updateDoctor,
    deleteDoctor,
  } = useDoctors()
  const [formOpen, setFormOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [doctorToDelete, setDoctorToDelete] = useState(null)
  const [viewMode, setViewMode] = useState('grid')

  const handleAdd = () => {
    setSelectedDoctor(null)
    setFormOpen(true)
  }

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor)
    setFormOpen(true)
  }

  const handleDelete = (doctor) => {
    setDoctorToDelete(doctor)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (doctorToDelete) {
      await deleteDoctor(doctorToDelete.id)
    }
    setDeleteDialogOpen(false)
    setDoctorToDelete(null)
  }

  const handleSubmit = async (formData) => {
    let result
    if (selectedDoctor) {
      result = await updateDoctor(selectedDoctor.id, formData)
    } else {
      result = await createDoctor(formData)
    }

    if (result.success) {
      setFormOpen(false)
      setSelectedDoctor(null)
    }
  }

  const renderGridView = () => (
    <Grid container spacing={3}>
      {doctors.map((doctor) => (
        <Grid item xs={12} sm={6} md={4} key={doctor.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {doctor.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {doctor.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {doctor.phone}
              </Typography>
              <Chip
                label={doctor.specialty}
                size="small"
                sx={{ mt: 1, mb: 1 }}
              />
              <Typography variant="body2" gutterBottom>
                Experience: {doctor.experience} years
              </Typography>
              <Typography variant="body2" gutterBottom>
                {doctor.qualification}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleEdit(doctor)}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(doctor)}
                >
                  <Delete />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )

  const renderTableView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Specialty</TableCell>
            <TableCell>Experience</TableCell>
            <TableCell>Qualification</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {doctor.name}
                </Typography>
              </TableCell>
              <TableCell>{doctor.email}</TableCell>
              <TableCell>{doctor.phone}</TableCell>
              <TableCell>
                <Chip label={doctor.specialty} size="small" />
              </TableCell>
              <TableCell>{doctor.experience} years</TableCell>
              <TableCell>{doctor.qualification}</TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEdit(doctor)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(doctor)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Doctors</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {userRole === 'admin' && (
            <>
              <ViewToggle view={viewMode} onChange={setViewMode} />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAdd}
              >
                Add Doctor
              </Button>
            </>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : doctors.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No doctors found</Typography>
        </Box>
      ) : (
        viewMode === 'grid' ? renderGridView() : renderTableView()
      )}

      <DoctorForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setSelectedDoctor(null)
        }}
        onSubmit={handleSubmit}
        initialData={selectedDoctor}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Doctor</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {doctorToDelete?.name}? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

