import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CButton,
  CSpinner,
} from '@coreui/react'
import { useState, useEffect } from 'react'

const ResetPasswordModal = ({ visible, onClose, onSubmit, loading, playerId, playerInfo }) => {
  const [form, setForm] = useState({
    password: '',
    password_confirmation: '',
  })

  useEffect(() => {
    if (visible) {
      setForm({ password: '', password_confirmation: '' })
    }
  }, [visible])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity()
      return
    }

    if (form.password !== form.password_confirmation) {
      alert('Passwords do not match')
      return
    }

    onSubmit({
      id: playerId,
      password: form.password,
      password_confirmation: form.password_confirmation,
    })
  }

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Reset Password</CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          {/* Account Info */}
          <div className="d-flex justify-content-between align-items-center p-2 mb-3 border rounded">
            <div>
              <div className="text-muted small">Account</div>
              <div className="fw-semibold">{playerInfo?.Account}</div>
            </div>
          </div>

          {/* Password */}
          <CFormInput
            label="New Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="mb-3"
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$"
            title="Must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
          />

          {/* Confirm Password */}
          <CFormInput
            label="Confirm Password"
            type="password"
            name="password_confirmation"
            value={form.password_confirmation}
            onChange={handleChange}
            required
            className="mb-3"
          />
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Cancel
          </CButton>

          <CButton type="submit" color="danger" disabled={loading}>
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              'Reset Password'
            )}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ResetPasswordModal
