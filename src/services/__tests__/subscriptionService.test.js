import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getSubscriptionPricesWithDetails } from '../subscriptionService'

vi.mock('../appStoreConnectService', () => ({
  generateToken: vi.fn().mockResolvedValue('test-token'),
}))

function encodePriceId(payload) {
  return btoa(JSON.stringify(payload)).replace(/=+$/, '')
}

describe('subscriptionService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({
        data: [
          {
            id: encodePriceId({ t: 'US', p: 1 }),
            type: 'subscriptionPrices',
            attributes: { startDate: null, preserved: false },
            relationships: {
              subscriptionPricePoint: {
                data: { type: 'subscriptionPricePoints', id: 'price-point-b' },
              },
            },
          },
          {
            id: encodePriceId({ t: 'CA', p: 2 }),
            type: 'subscriptionPrices',
            attributes: { startDate: '2026-01-01', preserved: true },
            relationships: {
              subscriptionPricePoint: {
                data: { type: 'subscriptionPricePoints', id: 'price-point-a' },
              },
            },
          },
        ],
        included: [
          {
            id: 'price-point-a',
            type: 'subscriptionPricePoints',
            attributes: { customerPrice: '2.99', proceeds: '2.10' },
          },
          {
            id: 'price-point-b',
            type: 'subscriptionPricePoints',
            attributes: { customerPrice: '1.99', proceeds: '1.40' },
          },
        ],
        links: {},
      })),
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('matches subscription prices to included price points by relationship id', async () => {
    const prices = await getSubscriptionPricesWithDetails(
      { keyId: 'key', issuerId: 'issuer', privateKey: 'private' },
      'subscription-id'
    )

    expect(prices).toMatchObject([
      { territory: 'US', customerPrice: '1.99', proceeds: '1.40' },
      { territory: 'CA', customerPrice: '2.99', proceeds: '2.10' },
    ])
  })
})
