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

const WithdrawModal = ({ visible, onClose, onSubmit, loading, playerId }) => {
  const [form, setForm] = useState({
    balance: '',
    remark: '',
  })

  // reset when modal opens
  useEffect(() => {
    if (visible) {
      Promise.resolve().then(() => {
        setForm({ balance: '', remark: '' })
      })
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

    onSubmit({
      id: playerId,
      balance: Number(form.balance),
      remark: form.remark,
    })
  }

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Withdraw Player</CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          <CFormInput
            label="Balance"
            type="number"
            name="balance"
            value={form.balance}
            onChange={handleChange}
            required
            className="mb-3"
          />

          <CFormInput
            label="Remark"
            name="remark"
            value={form.remark}
            onChange={handleChange}
            placeholder="Optional note..."
          />
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Cancel
          </CButton>

          <CButton type="submit" color="warning" disabled={loading}>
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              'Withdraw'
            )}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default WithdrawModal
