import { createMachine, assign } from 'xstate'
import {
  LocationType,
  HousingStatusType,
  PropertyAddressType,
  AddressUPRNType,
  CouncilTaxBandType,
  SuggestedEPCIsCorrectType,
  PropertyHasEPCType,
  PropertyEPCDetailsType,
  ReceivingBenefitsType,
  HouseholdIncomeType,
  PropertyType,
  HouseType,
  BungalowType,
  FlatType,
  NumberOfBedroomsType,
  WallType,
  WallInsulationType,
  LoftType,
  LoftAccessType,
  LoftInsulationType,
  EnergySupplierType,
  LandlordPermissionType,
  PersonalDetailsType,
  SuggestedAddressType,
  EpcRatingType
} from './types'

export type GO_TO_QUESTION_TYPE =
  | 'GO_TO_ENERGY_SUPPLIER'
  | 'GO_TO_LANDLORD_PERMISSIONS'
  | 'GO_TO_PERSONAL_DETAILS'

const supportedCountry = (_context: unknown, event: { payload: string }) => {
  return ['England', 'Wales'].includes(event.payload)
}

const fetchAddressSuggestions = async ({
  buildingNumberOrName,
  postcode
}: PropertyAddressType) => {
  const fullAddress = `${buildingNumberOrName}, ${postcode}`
  let path = `/api/uprn?address=${fullAddress}`

  if (!buildingNumberOrName.length) {
    path = `/api/uprn?postcode=${postcode}`
  }

  return fetch(path, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((r) => r.json())
}

const fetchEPCForUPRN = async (addressUPRN: AddressUPRNType) => {
  const path = `/api/epc?uprn=${addressUPRN}`
  return fetch(path, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((r) => r.json())
}

const createLead = async (context: unknown) => {
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: context })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error)
    }

    return response.json()
  } catch (error) {
    // TODO: Log error w/ Sentry
    throw new Error('Something went wrong. Please try again later.')
  }
}

const nonEligibleEPCS = ['A', 'B', 'C']

const assignPropertyEpcDetails = assign({
  propertyEpcDetails: (
    _context,
    event: {
      payload: string
    }
  ) => {
    const { propertyEpcDate, propertyEpcRating } = JSON.parse(
      event.payload
    ) as unknown as PropertyEPCDetailsType
    return {
      propertyEpcDate,
      propertyEpcRating
    }
  }
})

const assignCouncilTaxBand = assign({
  councilTaxBand: (
    _context,
    event: {
      payload: CouncilTaxBandType
    }
  ) => event.payload
})

const assignSuggestedEPC = assign({
  suggestedEPCFound: (_context, event: any) => {
    const { date, rating } = event.data

    if (date && rating) {
      return true
    }

    return false
  },
  propertyEpcDetails: (_context, event: any) => {
    const { date, rating } = event.data

    if (!date || !rating) {
      return undefined
    }

    const segmentedDate = date.split('-')

    return {
      propertyEpcDate: {
        day: segmentedDate[2],
        month: segmentedDate[1],
        year: segmentedDate[0]
      },
      propertyEpcRating: rating as EpcRatingType
    }
  }
})

export const questionnaireMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QDMD2AnAtgOgA7tVzHQBcBPAfQBtUBjAQxIEtUA7AYgEEA5AZQHUAogCUA2gAYAuolC5UsJszYyQAD0QBGAJwA2cdh0AOAOwBWAMxaN58QCZDhgDQgyiW6cOnsWgCw-dPjo+pj6GtuYAvhHOaFh4BESklDQMShw8AiKiGtJIIHIKaSrqCNp6BiYWVjb2Ti6aWlrG2OY2WuLG1va2PrZRMRg4+ITE5BSoAO6sxLAAFky4XHxCYlIqBYosrMVuOrb6Gp1Wng7+1s6uCO4attiBhj7iN+LmGo-G-SCxQwmjlJPTdBzBbsAAKwkEADUAJIAeQAqrwJLlZPJNso8iVbBpxD5sJ4tDZDDprDobMYLm4LF4-P5TKZjJ4gk1Pt94iMkhR6BAIOg4LAwRCYQikWs8hsipi3MZzHjxB0HLZ9hoNKZVZSrnpDN5sWqtErjI0NKzBuzEmNubz+UtMqsUfk0ZLQFjjH5sNoLOZjDotIZ2riNfZTPpeqqOj4NHtZSa4sNzZRLXzYLAKMgmKwIMRqKhuemoOwIGwwNh0wA3VAAa2LyDAJFos04PKTsF4AFcoDBYGlYMj1o6tjsEIZzF4dEdxH7jMZxHsNbKZdgOlPgrZfcO+tEvqa438uU3+an05n0Nnc6x88QCOg8FRGGya3WG-vk22O3Bu73xf2Mc7EMPR+Ok7TrO9QIK0Y7YAyy42JYHg+DGPwchaz4pmmGZZjQZ75uCUJwoin6ooUA5SkOI4GIBTTAbYc5PM0NyBK8so+ns8GbmyO6comB5ocep4QHmNorARDpET+ah-mRY7aBOlEztRoG2GYtxBIY4i+lY+wzghZq7lxyaHuhJ6Xhggq4SKwkSsRv6lI85iLuEvQRjcMqMnO5h+ouITkkEexQdpHHIVa+mwGAVBgLQJCmcK+FioR6LbCRbwvPZso9CqilenUlyyqpLS4m0pj2Lo5g6P5vycShFAhWFEWCVksUifFg5JXZdipU5GWuaBJXWPi+WWMS5iKd6ZVIZQsDtp2JCQBQYC4LQfECYW0wlqw5ZVtg7HlWME1vl2M1zQtmH8eeCBlnQjBbMiFnfgl1llPoRhmJY1h2A4c56Bonk+K88phFoDKjfGVWTe+B3zYt57sMZ164LeJD3tu23jaD+0QLNEPHXmZ1rRdaTXQ1lliSUD0VM91RvVliAlb4kHhg8rRvBohhA7utCoK2rC0EwVAUCQ9CqFFeGivaRN3eJmr7O6RzMx4DzVB99LYNiw66BYbzkqznLs5z3O8-zgsZEJhO3YO+yri0piEsShgqj6Zhzk02q6LihL7J0JKlWxSNjRQOtczzfMC3VYg5H2oni1i8pfdiE7yv4JjaBSoHvDSpLpUNTwbgMcSHamHMZkL5kmxHzUmO6oR+G82JDa6phzicys4sGvihMOPgfN7ucQ2gnMQCHN2l4l5dvA8EahrXwQan4OgAToY5DWEinZ1u3cLb3hdG1kYdfkP90j5X4814pU8p4azTL27YRDZG2l54WcDjFMWazPQpZgBQmb8zzAo4dFIvhyaiRfYXgcSElnoVGcehxD1xThGUB3p55+CVD9LQd8IYPxTACF+b8P5f3oD-Iu+Ed5xSdBLf85FpJATktPHotw7aIMOFnL2OccD31QI-bBJ5X7v0-rWAhVABRbztIAshJQKFSXaNQkClxAgWEggxGUtsOhWHQQtTBT9AQUB4Xg-hhDhHZFFqbEiEiKJThoXA70ytoFx31D0VirDsB5z5AAR1bO+Ph39BFEIAbvIB1kAjYE6GpRo1Qwiumnr0LwZhQn6iGk5NRFBXHuK7J4gRQjlj1SMXvCWLUUqOXSi5KmCAq52RKmOQ0wRfSukSckjx+D9GZNDtk-xuTbL5LSs5TK08W74m0JOSuxh3CJNYKgEgs0qBMCgEwAARmFHxg9Wkk2DDoShbsDTMmniVW4xIKkznlLiVU2k+S0DAEwUseYKAzLANMNMJBf5CmFossRDRyhPSqK9WoWy9j4nnuYmx8DjnhTORc88VyblgDuRk20zyrK5JdmTD5NR3opytniQ4bwyTVzsKYbSswOYhXxVQdG6Z2aYDAAskuSy3A4jxASIkJISrkh6T9ShXpVQA2HJELuOB8WtkJagYlFBSWoHJQPKlLzJYHBliceW5xUW6G8LiQ0qpqQODxQSsARKSVc1FRSgxJDGqStsHsaV2hZanAVinKBBgO5mBJJ8t42kUj0F5v7PWINcByFIJSlpxqZRygVEvJ4qp1SosCHcZVByOgDWdRdN1BcPUTS9RgSKABhWE3AAAq0JuDwkELC4m1Nma3DkhYToSo1LmBZasx4Hcwg+i9IDHl2AKxHnGMgCgAUyC+tEXCkoN99Cx05XJEcPgemKvaB3CcxIhk2FxS2ttGYO1duRgsw1YtByvDCIuXy7LK2Emnt6OyWo7BWEZDOY0i722oE7d28Vfr+3U0rS0X0EYRyfReDoQMq4tDunlLoRlvhGTaSXejW9q6xoDw3cY6y27tQ9EaAycChxhxuSVkuRO+oLB+lAzeu9a6DG2EfUWsCzMEP+ABjKHqjJq3dXlncPwZhvQmEND0PDy6IPdu0Zq3tfjjWmulua2VZw6OXFjnS10J9wgscOBx8DBHfZ8pCg+vtpGTVSwxccOWonAyqpaK6EqDJhwmG5Y4sDK7uMzM5lAV1kw+OkKfVKoT2nLXyuyg5FoikG2qiVISMzq8cAWa48jK5Nm7MTFU-xpzGmzWublWJ4tXp8Sul8lXCcDjAutvw5B4GyB4YOaNTFwTWmLUJenk8VZbxGS-tgh3eTlnQv5cYFFxz6mSsyp01a7K05onM0eB8k1rRtKsFbJga5J4IPXN5KgUVDyzIxRI5HYtO6y37v2IehSIRbjBjrlYOOJgRtjYmyu6bBA5utaK6R7dpa90Vo24lq4sFIIhEjEYFZs6tZjAmK67xf8nkSqc0NAG+JfTBhjR3T0gZ-ClpjWOUwJI-QsKy9xn7VBvEGMB9dmwqyJxWwR+EdwdgNTkeaFJOwU5PRTgC2yNHvN0wTXhlsQrm7gEdeE119zbgYF4i9BGBtVh-DaTp8K1gjPLpsEu6z6ysWXNld06BSMhJGOBHnlbacqoWYtpoMgSK-3i5LbNgGxcQbK0qjVLAy4qG-2TlnUSFBndHE68ipjw3bOPB0ynADOws8niPY5aso0hp56vDSnG3X0G3cy7JPoEchJXQThYh0En7gdueBq5eu2WvHH0FoKc-SJBUDZgj-rxbanlvOdKyJ7rmgQi1vPTAvHrttK5-zymQvxeXdNMLRX2XVfOf+8sH+nDhnkMTleOH8ZDPWxM8l6X3xbXe-G-lGYNUwQGSHBJ3SbwVhW72F6PqSfovxdpCl7BiWJ90UA0OITxHJUSfNwMPEv0ql2XI7ZPWcKFYKBkA5ieegYuEwMwLO5+WI7O8WCuVu5si4TI7Qa+2GNOpon+tA3+v+rY-+gBwB8+hi5eZs4B8uNepQsof6LwxIkCJqfocmLayBqBf+XImBQI7AGa2aua+aPeeBmmnWbm-uMCoCtcq48oq4VsaC1BswX+P+dBABsAQBjBAA4rCBQFmgoeCLCKCCIFmgAJoUAAAysIaanAOama7BiUCK7yL0yKxSzMiqjM1groQyDk7+pokyqSEGoUYA0ycyH8sAn+5K82-8xhMuy+puyooalumg8cT+Q2dcY4RgmWbIzh4yrhYUHhYUVUPhcATBmaOaeaBaWOFeN2u67g62VaJOERZI9gb0q4oQCO2k9Ys2IUnqcMTAxAIBOSA6QhoOngK+84UOiuvB7oQ0COTKdgvQjuWWdR8gXhrYXqkyLRruuBJEQ0UsA076COTwX6GoxI+g7Qeg7KIaQQtR+KkxjRsx6AkeCxcG2gtwROqoho2GVsj2hUtwAM5I9IlBTQjhcQt4GYNA6A6MiQmATAyYzO2BeRW6JahR5aNwD2GoJIf6jwewx68cHQzqABEAvx-xxAgJwJku8x0W6mroV+VOPofoTwGokCdwFgHQbxu+I0LaiQsAbArq9B6M7MrA-MEUaShCoJUeF++B1eXOCACe7o9IRoi8M4ng-kMwTJvMaJfsbAHJ4yDSf2jy5kMGbRuwnBHO3BsJkYSqiJMeuIKJ9J0prAzJcpbJipXJGO3eYJbOWpEBhBXodklGvgJguIa+wQtRbAaYWALJIMMygJeuqpZe+JS+soJujIwa5uYasiPo3ghUb6+U8oJI3prAvpmA-pE0gZigTBEIBhggOhggnAAAIgERftOHiC8aSBlialoJsV9ODn7lJO7B4GmRmVma2DmeMljFDMtMWOdBtLQHyIwGANoWANyOWSTKYZUOYZTCTg8NqMOObrthbu2UwH6XKdmUGZDBeOgFeDeHeEgSOdNOOZOXafdDOeTJ8iih5niE2SON6GlD9GMR-j6RuZmVuV2Tub2dhCGQvldhXqTGYRTF8gpHYMrJRt6Mxq3K+Uge+ZucutuYoLNPuSZDyRcXyQ6QQYKUNK1AckqOrEaSvGyOmKFFMrMqkf7CQOgD2hhWGWbLSviA8YnqSMyorr4KssODJOEr+rfJ8KMpmPAHkN8JhSUAALTfqgSSVfbJB4xwrS65Lej3k1YAzX5XGPbKjajkiBAYqegT70mhZcLAi4BiVuCyhVmHB2KWB47EiBghByj2A2Avnzy2xwWxihZ6TCWL5my+A7JhCmaU4dBvD2VqiRlVI4iqSHaGW+xeUGS8S-lmUlI9CUJ+gfH2z6iBi+j0I9AsRnBqTWCyV7hBSoRHhZgwxJUqjJQeD45PB+AI7FLgS45eQdCtUGlFVxXVThQkCVXPADGqQ9BDFuXJzZQdyNktVjhVLuDuWITAy7RTTgxHQ5gnRQCVUQIKI+jhCqSqg+gfS9QXp+juQa4I5xE+zAzuqBwGxJV+Z2QBo2BPCVArIfRDRNyqz44eApmJIbwQBJW9CRK9SHDzxBC9A9CWCJIaJcLaK4LWneWAWDhqh2RNnpS+g4hKiRLhBBLCGNCE4JItrOJgBuL1J6KCK9XlDWD47BD7IeDySyI-S84-StB1pbUjgjJjITIUWeFrVKx15xLbUI71kpzsqUnrGvbRynVxAnIgqXLXK3KKCw2KUkzASUnbp0jhgMgsroqdARirg2U3Aar8paqCo6pkpgDXUlTNCHJ7Bqy+C4jjqoqFTKwhCU6vBVXi04AuoJq6yBzJreo9UMXAIvGRrlGJkhKBA9IhDeAOA4hehKjzwiHmY5bdpJVjp4jU4w4Moyh6bYh3AcqGi4gEgLoJ2caKbAzKam3+0y7lL4hx6hAaaeA000q2yWxqT7DlLuQkWmjBYl27jWbngRZm2PB5TToVoRg+5zgyZeY1YkhPH+YNYha+zNZ+0+XAJHWe42yzxjw-QNxDI6jWC+AAxq4sgtqjbjZZhTaQDnaYDy2gFuCB3pUOX+DIKaUw6e7m0I5WH0hFV07X0algQOVBIBpxKJ6Z0cUpX2x6BNCNCj7C6-bH4z4S7iwK1uAM0tA3A2UvkwIjWaCGjRJ2pVXtA3DzyT7XV+X4gBUuRmDBV21QFWAJkrJVUOCyhXo5554Hgd7O7XU-SrI+jbYhr77+7BhfQPCoaqTzzaBg3a63pT5i7wNkJINXCkOKiBWUNa0P69AGBWzBVdETjDKiHiFoEYHSEzBm1WL45GhjgOQwIP42BBImB7DhA4bMNZYJErpuEpFeHpE-3UoKPqNKMUO7YhV9G9S6i+h6D1rxyHH1FTEzHNHoDJ3-1p1AN27kk-JLGQIAblFOPxFokYldpYlAkKBiTyNCF-pJRq67HORYMID0ilqvSknpSRgzV4CmnmnLqWm55KnE1ePGrxLKyUFfq2QmDknBAGA6MTh72rj8WOJskdlfndkkO+PkNegqOBOXBNAtCtBLGwQ+jx3jEIWflIXfkoWJUV25KzylMIkkhKQzgLl0oHKywmp6CrjrmIXozIXjIVWnNYhLGvqU1NBE7ThVN4V0yCFFG0p2DemYBwy1jl3L0y461BKyj3XMyr43OK6eB4g9AXpDZYrZ5ZZkWTLuPymcw0WXBwsX4It3XRyPVotW5rEtD87B5oMYtRBRBAA */
    predictableActionArguments: true,
    tsTypes: {} as import('./questionnaireMachine.typegen').Typegen0,
    schema: {
      context: {} as {
        location: LocationType
        housingStatus: HousingStatusType
        address: PropertyAddressType
        addressUPRN: AddressUPRNType
        councilTaxBand: CouncilTaxBandType
        suggestedEPCIsCorrect: SuggestedEPCIsCorrectType
        propertyHasEpc?: PropertyHasEPCType
        propertyEpcDetails?: PropertyEPCDetailsType
        receivingBenefits: ReceivingBenefitsType
        householdIncome: HouseholdIncomeType
        property: PropertyType
        house: HouseType
        bungalow: BungalowType
        flat: FlatType
        numberOfBedrooms: NumberOfBedroomsType
        walls: WallType
        wallInsulation: WallInsulationType
        loft: LoftType
        loftAccess: LoftAccessType
        loftInsulation: LoftInsulationType
        energySupplier: EnergySupplierType
        landlordPermission: LandlordPermissionType
        personalDetails: PersonalDetailsType
        // support
        suggestedAddresses?: SuggestedAddressType[]
        suggestedAddressesError?: string
        counciltaxBandsSize: 8 | 9
        suggestedEPCFound: boolean
      },
      events: {} as  // | { type: 'NEXT' }
        | { type: 'ANSWER'; payload: string }
        | { type: 'PREVIOUS'; duration: number }
        | { type: 'CREATE_LEAD' }
        | { type: 'CONTINUE' }
        | { type: 'GO_TO_ENERGY_SUPPLIER' }
        | { type: 'GO_TO_LANDLORD_PERMISSIONS' }
        | { type: 'GO_TO_PERSONAL_DETAILS' }
    },
    id: 'form',
    initial: 'property_location',
    states: {
      property_location: {
        on: {
          ANSWER: [
            {
              actions: assign({
                location: (_context, event) => event.payload as LocationType
              }),
              target: 'property_ownership',
              cond: supportedCountry
            },
            {
              actions: assign({
                location: (_context, event) => event.payload as LocationType
              }),
              target: 'ineligible_country'
            }
          ]
        }
      },
      property_ownership: {
        on: {
          ANSWER: {
            actions: assign({
              housingStatus: (_context, event) => event.payload as HousingStatusType
            }),
            target: 'property_address'
          },
          PREVIOUS: 'property_location'
        }
      },
      property_address: {
        on: {
          PREVIOUS: [
            {
              target: 'property_ownership'
            }
          ],
          ANSWER: {
            actions: assign({
              address: (_context, event) => {
                const { postcode, buildingNumberOrName } = JSON.parse(
                  event.payload
                ) as unknown as PropertyAddressType
                return {
                  buildingNumberOrName,
                  postcode
                }
              }
            }),
            target: 'property_address_finder_loading'
          }
        }
      },

      property_address_finder_loading: {
        invoke: {
          id: 'fetchAddressSuggestions',
          src: 'getAddressSuggestions',
          onDone: {
            target: 'property_address_select',
            actions: assign({ suggestedAddresses: (_context, event) => event.data })
          },
          onError: {
            target: 'property_address_finder_error',
            actions: assign({
              suggestedAddressesError: () => 'Something went wrong'
            })
          }
        },
        on: {
          PREVIOUS: 'property_address',
          ANSWER: {
            target: 'complete'
          }
        }
      },

      property_address_finder_error: {
        on: {
          PREVIOUS: 'property_address'
        },
        exit: 'clearAddressSuggestionsError'
      },

      property_address_select: {
        on: {
          PREVIOUS: {
            target: 'property_address'
          },
          ANSWER: {
            actions: assign({
              addressUPRN: (_context, event) => event.payload as AddressUPRNType
            }),
            target: 'property_suggested_epc_loading'
          }
        },
        exit: ['clearAddressSuggestions']
      },

      property_suggested_epc_loading: {
        invoke: {
          src: 'getEPCForUPRN',
          onDone: [
            {
              target: 'epc_found',
              actions: assignSuggestedEPC,
              cond: (_context, event) => {
                return !!event?.data?.rating
              }
            },
            {
              target: 'epc_not_found',
              actions: assignSuggestedEPC
            }
          ],
          onError: {
            target: 'epc_not_found',
            actions: assign({
              suggestedEPCFound: () => false
            })
          }
        }
      },

      epc_not_found: {
        on: {
          PREVIOUS: {
            target: 'property_address'
          },
          CONTINUE: {
            target: 'epc_does_owner_have_details'
          }
        }
      },

      epc_found: {
        on: {
          PREVIOUS: {
            target: 'property_address'
          },
          ANSWER: [
            {
              actions: assign({
                suggestedEPCIsCorrect: (_context, event) =>
                  event.payload as SuggestedEPCIsCorrectType
              }),
              target: 'epc_does_owner_have_details',
              cond: (_context, event) => {
                return (event.payload as SuggestedEPCIsCorrectType) === 'no'
              }
            },
            {
              actions: assign({
                suggestedEPCIsCorrect: (_context, event) =>
                  event.payload as SuggestedEPCIsCorrectType
              }),
              target: 'property_council_tax'
            }
          ]
        }
      },

      epc_does_owner_have_details: {
        on: {
          PREVIOUS: [
            {
              target: 'epc_found',
              cond: (context) => {
                return context.suggestedEPCFound
              }
            },
            {
              target: 'property_address'
            }
          ],
          ANSWER: [
            {
              actions: assign({
                propertyHasEpc: (_context, event) => event.payload as PropertyHasEPCType
              }),
              target: 'property_council_tax',
              cond: (_context, event) => {
                return (event.payload as PropertyHasEPCType) === 'no'
              }
            },
            {
              actions: assign({
                propertyHasEpc: (_context, event) => event.payload as PropertyHasEPCType
              }),
              target: 'epc_request_details'
            }
          ]
        }
      },
      epc_request_details: {
        on: {
          PREVIOUS: {
            target: 'epc_does_owner_have_details'
          },
          ANSWER: [
            {
              actions: assignPropertyEpcDetails,
              target: 'epc_not_eligible',
              cond: (_context, event) => {
                const { propertyEpcRating } = JSON.parse(
                  event.payload
                ) as unknown as PropertyEPCDetailsType
                return nonEligibleEPCS.includes(propertyEpcRating)
              }
            },
            {
              actions: assignPropertyEpcDetails,
              target: 'property_council_tax'
            }
          ]
        }
      },

      epc_not_eligible: {
        on: {
          PREVIOUS: {
            target: 'epc_request_details'
          }
        }
      },

      property_council_tax: {
        entry: ['calculateCouncilTaxBandSize'],
        on: {
          PREVIOUS: [
            {
              target: 'epc_request_details',
              cond: (_context) => {
                return (
                  (_context.suggestedEPCIsCorrect === 'no' &&
                    _context.propertyHasEpc === 'yes') ||
                  (!!_context.propertyEpcDetails?.propertyEpcRating &&
                    !_context.suggestedEPCFound)
                )
              }
            },
            {
              target: 'epc_does_owner_have_details',
              cond: (_context) => {
                return (
                  (_context.suggestedEPCIsCorrect === 'no' &&
                    _context.propertyHasEpc === 'no') ||
                  !_context.suggestedEPCFound
                )
              }
            },
            {
              target: 'epc_found',
              cond: (_context) => {
                return _context.suggestedEPCFound
              }
            },
            {
              target: 'property_address'
            }
          ],
          ANSWER: [
            {
              actions: assignCouncilTaxBand,
              target: 'receiving_benefits'
            }
          ]
        }
      },

      receiving_benefits: {
        on: {
          PREVIOUS: {
            target: 'property_council_tax'
          },
          ANSWER: {
            actions: assign({
              receivingBenefits: (_context, event) =>
                event.payload as ReceivingBenefitsType
            }),
            target: 'household_income'
          }
        }
      },
      household_income: {
        on: {
          PREVIOUS: {
            target: 'receiving_benefits'
          },
          ANSWER: [
            {
              actions: assign({
                householdIncome: (_context, event) => event.payload as HouseholdIncomeType
              }),
              cond: (context, event) => {
                return (
                  context.receivingBenefits === 'no' &&
                  (event.payload as HouseholdIncomeType) === '<£31k'
                )
              },
              target: 'local_council_support'
            },
            {
              actions: assign({
                householdIncome: (_context, event) => event.payload as HouseholdIncomeType
              }),
              target: 'kind_of_property'
            }
          ]
        }
      },
      local_council_support: {
        on: {
          PREVIOUS: {
            target: 'household_income'
          },
          CONTINUE: {
            target: 'kind_of_property'
          }
        }
      },
      kind_of_property: {
        on: {
          PREVIOUS: [
            {
              target: 'local_council_support',
              cond: (context) => {
                return (
                  context.receivingBenefits === 'no' &&
                  context.householdIncome === '<£31k'
                )
              }
            },
            {
              target: 'household_income'
            }
          ],
          ANSWER: [
            {
              actions: assign({
                property: (_context, event) => event.payload as PropertyType
              }),
              target: 'kind_of_property_house',
              cond: (_context, event) => {
                return 'house' === (event.payload as PropertyType)
              }
            },
            {
              actions: assign({
                property: (_context, event) => event.payload as PropertyType
              }),
              target: 'kind_of_property_bungalow',
              cond: (_context, event) => {
                return 'bungalow' === (event.payload as PropertyType)
              }
            },
            {
              actions: assign({
                property: (_context, event) => event.payload as PropertyType
              }),
              target: 'kind_of_property_flat',
              cond: (_context, event) => {
                return 'apartment' === (event.payload as PropertyType)
              }
            }
          ]
        }
      },

      kind_of_property_house: {
        on: {
          PREVIOUS: {
            target: 'kind_of_property'
          },
          ANSWER: {
            actions: assign({
              house: (_context, event) => event.payload as HouseType
            }),
            target: 'number_of_bedrooms'
          }
        }
      },
      kind_of_property_bungalow: {
        on: {
          PREVIOUS: {
            target: 'kind_of_property'
          },
          ANSWER: {
            actions: assign({
              bungalow: (_context, event) => event.payload as BungalowType
            }),
            target: 'number_of_bedrooms'
          }
        }
      },
      kind_of_property_flat: {
        on: {
          PREVIOUS: {
            target: 'kind_of_property'
          },
          ANSWER: {
            actions: assign({
              flat: (_context, event) => event.payload as FlatType
            }),
            target: 'number_of_bedrooms'
          }
        }
      },
      number_of_bedrooms: {
        on: {
          PREVIOUS: {
            target: 'kind_of_property'
          },
          ANSWER: {
            actions: assign({
              numberOfBedrooms: (_context, event) => event.payload as NumberOfBedroomsType
            }),
            target: 'property_walls'
          }
        }
      },
      property_walls: {
        on: {
          PREVIOUS: {
            target: 'number_of_bedrooms'
          },
          ANSWER: {
            actions: assign({
              walls: (_context, event) => event.payload as WallType
            }),
            target: 'wall_insulation'
          }
        }
      },
      wall_insulation: {
        on: {
          PREVIOUS: {
            target: 'property_walls'
          },
          ANSWER: {
            actions: assign({
              wallInsulation: (_context, event) => event.payload as WallInsulationType
            }),
            target: 'loft'
          }
        }
      },
      loft: {
        on: {
          PREVIOUS: {
            target: 'wall_insulation'
          },
          ANSWER: [
            {
              actions: assign({
                loft: (_context, event) => event.payload as LoftType
              }),
              target: 'access_to_loft',
              cond: (_context, event) => {
                return 'yes' === (event.payload as LoftType)
              }
            },
            {
              actions: assign({
                loft: (_context, event) => event.payload as LoftType
              }),
              target: 'check_your_answers'
            }
          ]
        }
      },
      access_to_loft: {
        on: {
          PREVIOUS: {
            target: 'loft'
          },
          ANSWER: {
            actions: assign({
              loftAccess: (_context, event) => event.payload as LoftAccessType
            }),
            target: 'loft_insulation'
          }
        }
      },
      loft_insulation: {
        on: {
          PREVIOUS: {
            target: 'access_to_loft'
          },
          ANSWER: {
            actions: assign({
              loftInsulation: (_context, event) => event.payload as LoftInsulationType
            }),
            target: 'check_your_answers'
          }
        }
      },
      check_your_answers: {
        on: {
          PREVIOUS: [
            {
              target: 'loft_insulation',
              cond: (context) => {
                return context.loft === 'yes'
              }
            },
            {
              target: 'loft'
            }
          ],
          CONTINUE: {
            target: 'list_of_elegible_schemes'
          },
          GO_TO_ENERGY_SUPPLIER: {
            target: 'choose_supplier'
          },
          GO_TO_PERSONAL_DETAILS: {
            target: 'personal_and_contact_details'
          },
          GO_TO_LANDLORD_PERMISSIONS: {
            target: 'landlord_permission'
          }
        }
      },
      list_of_elegible_schemes: {
        on: {
          PREVIOUS: {
            target: 'check_your_answers'
          },
          CONTINUE: {
            target: 'choose_supplier'
          }
        }
      },
      choose_supplier: {
        on: {
          PREVIOUS: {
            target: 'list_of_elegible_schemes'
          },
          ANSWER: [
            {
              actions: assign({
                energySupplier: (_context, event) => event.payload as EnergySupplierType
              }),
              target: 'personal_and_contact_details',
              cond: (context) => {
                const noPermissionRequired: HousingStatusType[] = ['owner', 'tenant']
                return noPermissionRequired.includes(context.housingStatus)
              }
            },
            {
              actions: assign({
                energySupplier: (_context, event) => event.payload as EnergySupplierType
              }),
              target: 'landlord_permission'
            }
          ]
        }
      },
      landlord_permission: {
        on: {
          PREVIOUS: {
            target: 'choose_supplier'
          },
          ANSWER: {
            actions: assign({
              landlordPermission: (_context, event) =>
                event.payload as LandlordPermissionType
            }),
            target: 'personal_and_contact_details'
          }
        }
      },
      personal_and_contact_details: {
        on: {
          PREVIOUS: [
            {
              target: 'choose_supplier',
              cond: (context) => {
                const noPermissionRequired: HousingStatusType[] = ['owner', 'tenant']
                return noPermissionRequired.includes(context.housingStatus)
              }
            },
            {
              target: 'landlord_permission'
            }
          ],
          ANSWER: {
            actions: assign({
              personalDetails: (_context, event) => {
                const { email, firstName, lastName, phoneNumber } = JSON.parse(
                  event.payload
                ) as unknown as PersonalDetailsType
                return {
                  email,
                  firstName,
                  lastName,
                  phoneNumber
                }
              }
            }),
            target: 'confirm_and_submit'
          }
        }
      },
      confirm_and_submit: {
        on: {
          PREVIOUS: {
            target: 'personal_and_contact_details'
          },
          CREATE_LEAD: {
            target: 'confirm_and_submit_loading'
          }
        }
      },

      confirm_and_submit_loading: {
        invoke: {
          id: 'createLead',
          src: 'submitForm',
          onDone: {
            target: 'complete'
          },
          onError: {
            target: 'confirm_and_submit_error'
          }
        },
        on: {
          PREVIOUS: 'confirm_and_submit'
        }
      },
      confirm_and_submit_error: {
        on: {
          PREVIOUS: 'confirm_and_submit'
        }
      },

      complete: { type: 'final' },

      ineligible_country: {
        on: {
          PREVIOUS: 'property_location'
        }
      }
    }
  },
  {
    actions: {
      clearAddressSuggestions: assign({ suggestedAddresses: undefined }),
      clearAddressSuggestionsError: assign({ suggestedAddressesError: undefined }),
      calculateCouncilTaxBandSize: assign({
        counciltaxBandsSize: (context) => {
          return context.location === 'England' ? 8 : 9
        }
      })
    },
    services: {
      getAddressSuggestions: (context) => fetchAddressSuggestions(context.address),
      // @ts-expect-error TODO: refactor this
      getEPCForUPRN: (context) => fetchEPCForUPRN(context.addressUPRN),
      submitForm: (context) => createLead(context)
    }
  }
)
