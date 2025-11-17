import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'

// Doctor Services
export const addDoctor = async (doctorData) => {
  try {
    const docRef = await addDoc(collection(db, 'doctors'), {
      ...doctorData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const updateDoctor = async (id, doctorData) => {
  try {
    await updateDoc(doc(db, 'doctors', id), {
      ...doctorData,
      updatedAt: new Date().toISOString(),
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const deleteDoctor = async (id) => {
  try {
    await deleteDoc(doc(db, 'doctors', id))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getDoctor = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, 'doctors', id))
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } }
    }
    return { success: false, error: 'Doctor not found' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getAllDoctors = async () => {
  try {
    const q = query(collection(db, 'doctors'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    const doctors = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return { success: true, data: doctors }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Patient Services
export const addPatient = async (patientData) => {
  try {
    const docRef = await addDoc(collection(db, 'patients'), {
      ...patientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const updatePatient = async (id, patientData) => {
  try {
    await updateDoc(doc(db, 'patients', id), {
      ...patientData,
      updatedAt: new Date().toISOString(),
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const deletePatient = async (id) => {
  try {
    await deleteDoc(doc(db, 'patients', id))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getPatient = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, 'patients', id))
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } }
    }
    return { success: false, error: 'Patient not found' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getAllPatients = async () => {
  try {
    const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    const patients = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return { success: true, data: patients }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getPatientsByDoctor = async (doctorId) => {
  try {
    const q = query(
      collection(db, 'patients'),
      where('assignedDoctor', '==', doctorId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const patients = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return { success: true, data: patients }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Get patient by user email (for patients to find their own record)
export const getPatientByEmail = async (email) => {
  try {
    const q = query(
      collection(db, 'patients'),
      where('email', '==', email)
    )
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      const patientDoc = querySnapshot.docs[0]
      return { success: true, data: { id: patientDoc.id, ...patientDoc.data() } }
    }
    return { success: false, error: 'Patient not found' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Patient Health Data
export const addPatientHealthData = async (patientId, healthData) => {
  try {
    const docRef = await addDoc(collection(db, 'patients', patientId, 'healthData'), {
      ...healthData,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getPatientHealthData = async (patientId) => {
  try {
    const q = query(
      collection(db, 'patients', patientId, 'healthData'),
      orderBy('date', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const healthData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return { success: true, data: healthData }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Assign patient to doctor (Admin function)
export const assignPatientToDoctor = async (patientId, doctorId) => {
  try {
    await updateDoc(doc(db, 'patients', patientId), {
      assignedDoctor: doctorId,
      updatedAt: new Date().toISOString(),
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Get all users (for admin)
export const getAllUsers = async () => {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return { success: true, data: users }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

