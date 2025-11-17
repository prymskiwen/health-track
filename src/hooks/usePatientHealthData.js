import { useState, useEffect, useCallback } from 'react'
import {
  getPatientHealthData,
  addPatientHealthData,
} from '../services/userService'

/**
 * Custom hook for managing patient health data
 * @param {string} patientId - Patient ID
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoLoad - Whether to automatically load health data on mount (default: true)
 * @returns {Object} Health data state and operations
 */
export const usePatientHealthData = (patientId, { autoLoad = true } = {}) => {
  const [healthData, setHealthData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadHealthData = useCallback(async () => {
    if (!patientId) {
      setHealthData([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await getPatientHealthData(patientId)
      if (result.success) {
        setHealthData(result.data)
      } else {
        setError(result.error || 'Failed to load health data')
        setHealthData([])
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading health data')
      setHealthData([])
    } finally {
      setLoading(false)
    }
  }, [patientId])

  const addHealthData = useCallback(async (formData) => {
    if (!patientId) {
      return { success: false, error: 'Patient ID is required' }
    }

    setError(null)
    try {
      const result = await addPatientHealthData(patientId, formData)
      if (result.success) {
        await loadHealthData() // Reload the data
        return { success: true, id: result.id }
      } else {
        setError(result.error || 'Failed to add health data')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while adding health data'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [patientId, loadHealthData])

  useEffect(() => {
    if (autoLoad && patientId) {
      loadHealthData()
    }
  }, [autoLoad, patientId, loadHealthData])

  // Get the most recent health data entry
  const latestHealthData = healthData.length > 0 ? healthData[0] : null

  return {
    healthData,
    latestHealthData,
    loading,
    error,
    loadHealthData,
    addHealthData,
  }
}

