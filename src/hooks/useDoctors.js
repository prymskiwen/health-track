import { useState, useEffect, useCallback } from 'react'
import {
  getAllDoctors,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctor,
} from '../services/userService'

/**
 * Custom hook for managing doctors
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoLoad - Whether to automatically load doctors on mount (default: true)
 * @returns {Object} Doctors state and operations
 */
export const useDoctors = ({ autoLoad = true } = {}) => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadDoctors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAllDoctors()
      if (result.success) {
        setDoctors(result.data)
      } else {
        setError(result.error || 'Failed to load doctors')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading doctors')
    } finally {
      setLoading(false)
    }
  }, [])

  const createDoctor = useCallback(async (doctorData) => {
    setError(null)
    try {
      const result = await addDoctor(doctorData)
      if (result.success) {
        await loadDoctors() // Reload the list
        return { success: true, id: result.id }
      } else {
        setError(result.error || 'Failed to create doctor')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while creating doctor'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [loadDoctors])

  const updateDoctorById = useCallback(async (id, doctorData) => {
    setError(null)
    try {
      const result = await updateDoctor(id, doctorData)
      if (result.success) {
        await loadDoctors() // Reload the list
        return { success: true }
      } else {
        setError(result.error || 'Failed to update doctor')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while updating doctor'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [loadDoctors])

  const removeDoctor = useCallback(async (id) => {
    setError(null)
    try {
      const result = await deleteDoctor(id)
      if (result.success) {
        await loadDoctors() // Reload the list
        return { success: true }
      } else {
        setError(result.error || 'Failed to delete doctor')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while deleting doctor'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [loadDoctors])

  const fetchDoctor = useCallback(async (id) => {
    setError(null)
    try {
      const result = await getDoctor(id)
      if (result.success) {
        return { success: true, data: result.data }
      } else {
        setError(result.error || 'Doctor not found')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while fetching doctor'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [])

  useEffect(() => {
    if (autoLoad) {
      loadDoctors()
    }
  }, [autoLoad, loadDoctors])

  return {
    doctors,
    loading,
    error,
    loadDoctors,
    createDoctor,
    updateDoctor: updateDoctorById,
    deleteDoctor: removeDoctor,
    getDoctor: fetchDoctor,
  }
}

