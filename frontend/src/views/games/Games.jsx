import { CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner, CButton } from '@coreui/react'

import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { useNavigate } from 'react-router-dom'

const Games = () => {
  const navigate = useNavigate()

  const { data: games = [], isFetching } = useQuery({
    queryKey: ['games'],
    queryFn: () => api.get('/admin/games').then((res) => res.data),
  })

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Games</strong>
          </CCardHeader>

          <CCardBody>
            {isFetching && (
              <div className="text-center py-4">
                <CSpinner color="primary" />
              </div>
            )}

            {!isFetching && (
              <CRow xs={{ cols: 2 }} md={{ cols: 4 }} lg={{ cols: 6 }} className="g-3">
                {games.map((game) => (
                  <CCol key={game.id}>
                    <CCard
                      onClick={() => navigate(`/games/${game.slug}`)}
                      className="overflow-hidden"
                      style={{
                        cursor: 'pointer',
                      }}
                    >
                      {/* IMAGE */}
                      <img
                        src={game.image}
                        alt={game.name}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />

                      {/* TEXT */}
                      <div className="p-2 text-center">
                        <div className="fw-semibold text-truncate">{game.name}</div>
                      </div>
                    </CCard>
                  </CCol>
                ))}
              </CRow>
            )}

            {!isFetching && games.length === 0 && (
              <div className="text-center text-muted py-4">No games found</div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Games
