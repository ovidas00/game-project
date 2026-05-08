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
  CFormCheck,
} from '@coreui/react'
import { useState, useEffect } from 'react'

const BalanceModal = ({ visible, onClose, onSubmit, loading, playerId, playerInfo }) => {
  const [type, setType] = useState('recharge')

  const [form, setForm] = useState({
    balance: '',
    remark: '',
  })

  useEffect(() => {
    if (visible) {
      setType('recharge')
      setForm({ balance: '', remark: '' })
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
      type,
    })
  }

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Manage Balance</CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          <div className="d-flex justify-content-between align-items-center p-2 mb-3 border rounded">
            <div>
              <div className="text-muted small">Account</div>
              <div className="fw-semibold">{playerInfo?.Account}</div>
            </div>

            <div className="text-end">
              <div className="text-muted small">Score</div>
              <div className="fw-semibold">{playerInfo?.score ?? 0}</div>
            </div>
          </div>

          {/* Radio Switch */}
          <div className="mb-3 d-flex gap-4">
            <CFormCheck
              type="radio"
              name="type"
              label="Recharge"
              checked={type === 'recharge'}
              onChange={() => setType('recharge')}
            />
            <CFormCheck
              type="radio"
              name="type"
              label="Withdraw"
              checked={type === 'withdraw'}
              onChange={() => setType('withdraw')}
            />
          </div>

          {/* Amount */}
          <CFormInput
            label={type === 'recharge' ? 'Recharge Amount' : 'Withdraw Amount'}
            type="number"
            name="balance"
            value={form.balance}
            onChange={handleChange}
            required
            className="mb-3"
          />

          {/* Remark */}
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

          <CButton
            type="submit"
            color={type === 'recharge' ? 'info' : 'warning'}
            disabled={loading}
          >
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Processing...
              </>
            ) : type === 'recharge' ? (
              'Recharge'
            ) : (
              'Withdraw'
            )}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default BalanceModal
