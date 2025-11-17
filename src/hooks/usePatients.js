import { useState, useEffect, useCallback } from 'react'
import {
  getAllPatients,
  getPatientsByDoctor,
  addPatient,
  updatePatient,
  deletePatient,
  assignPatientToDoctor,
  getPatientByEmail,
} from '../services/userService'
import { useAuth } from '../context/AuthContext'

/**
 * Custom hook for managing patients list
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoLoad - Whether to automatically load patients on mount (default: true)
 * @param {string} options.doctorId - Filter patients by doctor ID (for doctor role)
 * @returns {Object} Patients state and operations
 */
export const usePatients = ({ autoLoad = true, doctorId = null } = {}) => {
  const { currentUser, userRole } = useAuth()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadPatients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let result
      if (userRole === 'doctor') {
        const doctorIdToUse = doctorId || currentUser?.uid
        result = await getPatientsByDoctor(doctorIdToUse)
      } else {
        result = await getAllPatients()
      }

      if (result.success) {
        setPatients(result.data)
      } else {
        setError(result.error || 'Failed to load patients')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading patients')
    } finally {
      setLoading(false)
    }
  }, [userRole, currentUser?.uid, doctorId])

  const createPatient = useCallback(async (patientData) => {
    setError(null)
    try {
      const result = await addPatient(patientData)
      if (result.success) {
        await loadPatients() // Reload the list
        return { success: true, id: result.id }
      } else {
        setError(result.error || 'Failed to create patient')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while creating patient'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [loadPatients])

  const updatePatientById = useCallback(async (id, patientData) => {
    setError(null)
    try {
      const result = await updatePatient(id, patientData)
      if (result.success) {
        await loadPatients() // Reload the list
        return { success: true }
      } else {
        setError(result.error || 'Failed to update patient')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while updating patient'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [loadPatients])

  const removePatient = useCallback(async (id) => {
    setError(null)
    try {
      const result = await deletePatient(id)
      if (result.success) {
        await loadPatients() // Reload the list
        return { success: true }
      } else {
        setError(result.error || 'Failed to delete patient')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while deleting patient'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [loadPatients])

  const assignPatient = useCallback(async (patientId, doctorId) => {
    setError(null)
    try {
      const result = await assignPatientToDoctor(patientId, doctorId)
      if (result.success) {
        await loadPatients() // Reload the list
        return { success: true }
      } else {
        setError(result.error || 'Failed to assign patient')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while assigning patient'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [loadPatients])

  useEffect(() => {
    if (autoLoad) {
      loadPatients()
    }
  }, [autoLoad, loadPatients])

  return {
    patients,
    loading,
    error,
    loadPatients,
    createPatient,
    updatePatient: updatePatientById,
    deletePatient: removePatient,
    assignPatient,
  }
}

/**
 * Custom hook for getting a single patient by email
 * Useful for patients to find their own record
 * @param {string} email - Patient email
 * @param {boolean} autoLoad - Whether to automatically load on mount (default: true)
 * @returns {Object} Patient data and loading state
 */
export const usePatientByEmail = (email, autoLoad = true) => {
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadPatient = useCallback(async () => {
    if (!email) return

    setLoading(true)
    setError(null)
    try {
      const result = await getPatientByEmail(email)
      if (result.success) {
        setPatient(result.data)
      } else {
        setError(result.error || 'Patient not found')
        setPatient(null)
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading patient')
      setPatient(null)
    } finally {
      setLoading(false)
    }
  }, [email])

  useEffect(() => {
    if (autoLoad && email) {
      loadPatient()
    }
  }, [autoLoad, email, loadPatient])

  return {
    patient,
    loading,
    error,
    loadPatient,
  }
}

