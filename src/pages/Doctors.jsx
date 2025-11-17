import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import DoctorForm from '../components/forms/DoctorForm'
import ViewToggle from '../components/common/ViewToggle'
import DoctorsGrid from '../components/doctors/DoctorsGrid'
import DoctorsTable from '../components/doctors/DoctorsTable'
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
  const [viewMode, setViewMode] = useState('grid')
  const [formOpen, setFormOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [doctorToDelete, setDoctorToDelete] = useState(null)

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

  const handleFormClose = () => {
    setFormOpen(false)
    setSelectedDoctor(null)
  }

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false)
  }

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
        viewMode === 'grid' ? (
          <DoctorsGrid
            doctors={doctors}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <DoctorsTable
            doctors={doctors}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )
      )}

      <DoctorForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleSubmit}
        initialData={selectedDoctor}
      />

      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Doctor</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {doctorToDelete?.name}? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

