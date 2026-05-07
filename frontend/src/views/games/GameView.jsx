import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
  CBadge,
  CButton,
  CSpinner,
} from '@coreui/react'
import { useMemo, useState, useEffect } from 'react'

import { useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilPlus, cilSearch } from '@coreui/icons'

import AddPlayerModal from './AddPlayerModal'
import SearchPlayerModal from './SearchPlayerModal'
import RechargeModal from './RechargeModal'
import WithdrawModal from './WithdrawModal'

const GameView = () => {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  // modals
  const [searchVisible, setSearchVisible] = useState(false)
  const [addVisible, setAddVisible] = useState(false)
  const [rechargeVisible, setRechargeVisible] = useState(false)
  const [withdrawVisible, setWithdrawVisible] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  // filters
  const [filters, setFilters] = useState({
    id: '',
    account: '',
    nickname: '',
  })

  // add player mutation
  const addPlayerMutation = useMutation({
    mutationFn: (formData) => api.post(`/admin/games/${slug}/player`, formData),

    onSuccess: () => {
      setAddVisible(false)

      queryClient.invalidateQueries({
        queryKey: ['game-players', slug],
      })
    },

    onError: (err) => {
      console.error(err)
    },
  })

  // recharge mutation
  const rechargeMutation = useMutation({
    mutationFn: (formData) => api.post(`/admin/games/${slug}/player/recharge`, formData),

    onSuccess: () => {
      setRechargeVisible(false)

      queryClient.invalidateQueries({
        queryKey: ['game-players', slug],
      })
    },

    onError: (err) => {
      console.error(err)
    },
  })

  // withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: (formData) => api.post(`/admin/games/${slug}/player/withdraw`, formData),

    onSuccess: () => {
      setWithdrawVisible(false)

      queryClient.invalidateQueries({
        queryKey: ['game-players', slug],
      })
    },

    onError: (err) => {
      console.error(err)
    },
  })

  // login mutation
  const loginMutation = useMutation({
    mutationFn: () => api.post(`/admin/games/${slug}/login`),

    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ['game-players', slug],
      })
    },

    onError: (err) => {
      console.error(err)
    },
  })

  // sync filters with URL
  useEffect(() => {
    Promise.resolve().then(() => {
      setFilters({
        id: searchParams.get('id') || '',
        account: searchParams.get('account') || '',
        nickname: searchParams.get('nickname') || '',
      })
    })
  }, [searchParams])

  const paramsObj = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams])

  const { data: response, isFetching } = useQuery({
    queryKey: ['game-players', slug, paramsObj],
    queryFn: async () => {
      const res = await api.get(`/admin/games/${slug}/players`, {
        params: paramsObj,
      })
      return res.data
    },
    enabled: Boolean(slug),
  })

  const players = response?.data || []
  const meta = response?.meta || { page: 1, totalPages: 1 }

  // pagination
  const handlePageChange = (newPage) => {
    setSearchParams({
      ...paramsObj,
      page: String(newPage),
    })
  }

  const getPageNumbers = (page, totalPages, delta = 2) => {
    const range = []
    const start = Math.max(1, page - delta)
    const end = Math.min(totalPages, page + delta)

    for (let i = start; i <= end; i++) {
      range.push(i)
    }

    return range
  }

  // filter handlers
  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => {
    const newParams = {
      ...paramsObj,
      ...filters,
      page: '1',
    }

    Object.keys(newParams).forEach((key) => {
      if (!newParams[key]) delete newParams[key]
    })

    setSearchParams(newParams)
    setSearchVisible(false)
  }

  const resetFilters = () => {
    setFilters({ id: '', account: '', nickname: '' })
    setSearchParams({ page: '1' })
    setSearchVisible(false)
  }

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Game Players</strong>
          </CCardHeader>

          <CCardBody>
            {/* actions */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <CButton
                color="secondary"
                variant="outline"
                className="d-flex align-items-center gap-2"
                onClick={() => setSearchVisible(true)}
              >
                <CIcon icon={cilSearch} />
                Search
              </CButton>

              <CButton color="primary" onClick={() => setAddVisible(true)}>
                <CIcon icon={cilPlus} className="me-2" />
                Add Player
              </CButton>

              {/* Login button */}
              <CButton
                color="dark"
                variant="outline"
                className="d-flex align-items-center justify-content-center"
                style={{ width: 38, height: 38 }}
                onClick={() => loginMutation.mutate()}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? <CSpinner size="sm" /> : <CIcon icon={cilLockLocked} />}
              </CButton>
            </div>

            {/* table */}
            <CTable bordered hover responsive align="middle">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Account</CTableHeaderCell>
                  <CTableHeaderCell>Nickname</CTableHeaderCell>
                  <CTableHeaderCell>Score</CTableHeaderCell>
                  <CTableHeaderCell>L. Count</CTableHeaderCell>
                  <CTableHeaderCell>Last Login</CTableHeaderCell>
                  {/* <CTableHeaderCell>IP</CTableHeaderCell> */}
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Added</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {isFetching ? (
                  <CTableRow>
                    <CTableDataCell colSpan={9} className="text-center py-5">
                      <CSpinner color="primary" />
                    </CTableDataCell>
                  </CTableRow>
                ) : players.length > 0 ? (
                  players.map((p) => (
                    <CTableRow key={p.id}>
                      <CTableDataCell>{p.id}</CTableDataCell>
                      <CTableDataCell>{p.Account}</CTableDataCell>
                      <CTableDataCell>{p.nickname}</CTableDataCell>
                      <CTableDataCell>{p.score}</CTableDataCell>
                      <CTableDataCell>{p.LoginCount}</CTableDataCell>
                      <CTableDataCell>{p.lasttime}</CTableDataCell>
                      {/* <CTableDataCell>{p.loginip}</CTableDataCell> */}

                      <CTableDataCell>
                        <CBadge color={p.account_using === 1 ? 'success' : 'secondary'}>
                          {p.account_using === 1 ? 'Active' : 'Inactive'}
                        </CBadge>
                      </CTableDataCell>

                      <CTableDataCell className="text-nowrap">
                        {formatDateTime(p.AddDate)}
                      </CTableDataCell>

                      <CTableDataCell className="text-nowrap">
                        <div className="d-flex gap-2">
                          <CButton
                            color="info"
                            size="sm"
                            onClick={() => {
                              setSelectedPlayer(p.id)
                              setRechargeVisible(true)
                            }}
                          >
                            Recharge
                          </CButton>

                          <CButton
                            color="warning"
                            size="sm"
                            onClick={() => {
                              setSelectedPlayer(p.id)
                              setWithdrawVisible(true)
                            }}
                          >
                            Withdraw
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan={9} className="text-center text-muted">
                      No players found
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>

            {/* pagination */}
            {!isFetching && (
              <div className="d-flex justify-content-end mt-3">
                <CPagination>
                  <CPaginationItem
                    style={{ cursor: 'pointer' }}
                    disabled={meta.page <= 1}
                    onClick={() => handlePageChange(meta.page - 1)}
                  >
                    Prev
                  </CPaginationItem>

                  {getPageNumbers(meta.page, meta.totalPages).map((page) => (
                    <CPaginationItem
                      key={page}
                      style={{ cursor: 'pointer' }}
                      active={meta.page === page}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </CPaginationItem>
                  ))}

                  <CPaginationItem
                    style={{ cursor: 'pointer' }}
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => handlePageChange(meta.page + 1)}
                  >
                    Next
                  </CPaginationItem>
                </CPagination>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* modals */}
      <SearchPlayerModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        filters={filters}
        onChange={handleChange}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <AddPlayerModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        loading={addPlayerMutation.isPending}
        onSubmit={(formData) => addPlayerMutation.mutate(formData)}
      />

      <RechargeModal
        visible={rechargeVisible}
        onClose={() => setRechargeVisible(false)}
        playerId={selectedPlayer}
        loading={rechargeMutation.isPending}
        onSubmit={(data) => rechargeMutation.mutate(data)}
      />

      <WithdrawModal
        visible={withdrawVisible}
        onClose={() => setWithdrawVisible(false)}
        playerId={selectedPlayer}
        loading={withdrawMutation.isPending}
        onSubmit={(data) => withdrawMutation.mutate(data)}
      />
    </CRow>
  )
}

export default GameView
