import { SupplyData } from '@/entities/stock/types'
import { fetchKISInvestorDaily } from './fetchKISInvestor'
import { fetchSimulatedSupply } from './fetchSimulatedSupply'

/**
 * 수급 데이터 조회
 * 1차: KIS API 실제 투자자별 매매동향
 * 2차: 시뮬레이션 fallback (API 실패 시)
 */
export async function fetchSupply(ticker: string): Promise<SupplyData[]> {
  try {
    const data = await fetchKISInvestorDaily(ticker)
    if (data.length >= 5) {
      return data
    }
  } catch (error) {
    console.warn('[fetchSupply] KIS API failed, falling back to simulation:', error)
  }

  return fetchSimulatedSupply(ticker)
}
