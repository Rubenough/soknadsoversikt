import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useApplications(userId) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchApplications = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('applied_at', { ascending: false })
    if (error) {
      setError(error.message)
    } else {
      setApplications(data)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  async function addApplication(fields) {
    const payload = { ...fields, user_id: userId }
    if (!payload.deadline) payload.deadline = null
    if (!payload.outcome) payload.outcome = null
    if (!payload.interview_round) payload.interview_round = null
    const { data, error } = await supabase
      .from('applications')
      .insert([payload])
      .select()
      .single()
    if (error) throw error
    setApplications(prev => [data, ...prev])
    return data
  }

  async function updateApplication(id, fields) {
    const payload = { ...fields }
    if (!payload.deadline) payload.deadline = null
    if (!payload.outcome) payload.outcome = null
    if (!payload.interview_round) payload.interview_round = null
    const { data, error } = await supabase
      .from('applications')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setApplications(prev => prev.map(a => a.id === id ? data : a))
    return data
  }

  async function deleteApplication(id) {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)
    if (error) throw error
    setApplications(prev => prev.filter(a => a.id !== id))
  }

  return { applications, loading, error, addApplication, updateApplication, deleteApplication, refetch: fetchApplications }
}
