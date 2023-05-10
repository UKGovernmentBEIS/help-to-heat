import React from 'react'
import { useTranslation } from 'next-i18next'
import * as GovUK from 'govuk-react'
import { PersonalDetailsType, EnergySupplierType, LandlordPermissionType } from '@/types'
import { GO_TO_QUESTION_TYPE } from '@/questionnaireMachine'
import { Button } from '@/components/ui/Button'
import { useForm, SubmitHandler } from 'react-hook-form'

type Inputs = {
  acceptsTerms: boolean
}

export const CheckYourAnswers = (props: {
  onSubmit: () => void
  onGoToQuestion: (location: GO_TO_QUESTION_TYPE) => void
  answers: {
    personalDetails: PersonalDetailsType
    energySupplier: EnergySupplierType
    landlordPermission: LandlordPermissionType
  }
}) => {
  const { t } = useTranslation(['questionnaire'])

  const {
    register,
    handleSubmit,
    formState: { errors, submitCount }
  } = useForm<Inputs>({
    reValidateMode: 'onSubmit'
  })

  const onSubmit: SubmitHandler<Inputs> = () => {
    props.onSubmit()
  }

  const errorsToShow = Object.keys(errors)

  return (
    <div>
      <GovUK.Fieldset>
        <GovUK.Fieldset.Legend size="L">Confirm and submit</GovUK.Fieldset.Legend>

        <GovUK.Table>
          <GovUK.Table.Row>
            <GovUK.Table.Cell setWidth="one-third" bold>
              Energy suplier
            </GovUK.Table.Cell>
            <GovUK.Table.Cell width="100%">
              {props.answers.energySupplier}
            </GovUK.Table.Cell>
            <GovUK.Table.Cell>
              <GovUK.Link
                href="/questionnaire?step=1"
                onClick={(e) => {
                  e.preventDefault()
                  props.onGoToQuestion('GO_TO_ENERGY_SUPPLIER')
                }}
              >
                {
                  t('change', {
                    ns: 'common'
                  }) as string
                }
              </GovUK.Link>
            </GovUK.Table.Cell>
          </GovUK.Table.Row>
          <GovUK.Table.Row>
            <GovUK.Table.Cell setWidth="one-third" bold>
              Landlord permissions
            </GovUK.Table.Cell>
            <GovUK.Table.Cell width="100%">
              {props.answers.landlordPermission}
            </GovUK.Table.Cell>
            <GovUK.Table.Cell>
              <GovUK.Link
                href="/questionnaire?step=1"
                onClick={(e) => {
                  e.preventDefault()
                  props.onGoToQuestion('GO_TO_LANDLORD_PERMISSIONS')
                }}
              >
                {
                  t('change', {
                    ns: 'common'
                  }) as string
                }
              </GovUK.Link>
            </GovUK.Table.Cell>
          </GovUK.Table.Row>
          <GovUK.Table.Row>
            <GovUK.Table.Cell setWidth="one-third" bold>
              First name
            </GovUK.Table.Cell>
            <GovUK.Table.Cell width="100%">
              {props.answers.personalDetails?.firstName}
            </GovUK.Table.Cell>
            <GovUK.Table.Cell>
              <GovUK.Link
                href="/questionnaire?step=1"
                onClick={(e) => {
                  e.preventDefault()
                  props.onGoToQuestion('GO_TO_PERSONAL_DETAILS')
                }}
              >
                {
                  t('change', {
                    ns: 'common'
                  }) as string
                }
              </GovUK.Link>
            </GovUK.Table.Cell>
          </GovUK.Table.Row>
          <GovUK.Table.Row>
            <GovUK.Table.Cell setWidth="one-third" bold>
              Last name
            </GovUK.Table.Cell>
            <GovUK.Table.Cell width="100%">
              {props.answers.personalDetails?.lastName}
            </GovUK.Table.Cell>
            <GovUK.Table.Cell>
              <GovUK.Link
                href="/questionnaire?step=1"
                onClick={(e) => {
                  e.preventDefault()
                  props.onGoToQuestion('GO_TO_PERSONAL_DETAILS')
                }}
              >
                {
                  t('change', {
                    ns: 'common'
                  }) as string
                }
              </GovUK.Link>
            </GovUK.Table.Cell>
          </GovUK.Table.Row>
          <GovUK.Table.Row>
            <GovUK.Table.Cell setWidth="one-third" bold>
              Contact number
            </GovUK.Table.Cell>
            <GovUK.Table.Cell width="100%">
              {props.answers.personalDetails?.phoneNumber}
            </GovUK.Table.Cell>
            <GovUK.Table.Cell>
              <GovUK.Link
                href="/questionnaire?step=1"
                onClick={(e) => {
                  e.preventDefault()
                  props.onGoToQuestion('GO_TO_PERSONAL_DETAILS')
                }}
              >
                {
                  t('change', {
                    ns: 'common'
                  }) as string
                }
              </GovUK.Link>
            </GovUK.Table.Cell>
          </GovUK.Table.Row>
          <GovUK.Table.Row>
            <GovUK.Table.Cell setWidth="one-third" bold>
              Email
            </GovUK.Table.Cell>
            <GovUK.Table.Cell width="100%">
              {props.answers.personalDetails?.email}
            </GovUK.Table.Cell>
            <GovUK.Table.Cell>
              <GovUK.Link
                href="/questionnaire?step=1"
                onClick={(e) => {
                  e.preventDefault()
                  props.onGoToQuestion('GO_TO_PERSONAL_DETAILS')
                }}
              >
                {
                  t('change', {
                    ns: 'common'
                  }) as string
                }
              </GovUK.Link>
            </GovUK.Table.Cell>
          </GovUK.Table.Row>
        </GovUK.Table>
      </GovUK.Fieldset>

      <form onSubmit={handleSubmit(onSubmit)}>
        {!!errorsToShow?.length && (
          <GovUK.ErrorSummary
            heading={
              t('error-title', {
                ns: 'common'
              }) as string
            }
            description={
              t('error-message', {
                ns: 'common'
              }) as string
            }
          />
        )}

        <GovUK.FormGroup error={submitCount > 0 && !!errors?.acceptsTerms?.message}>
          <GovUK.Label mb={4}>
            {submitCount > 0 && errors?.acceptsTerms?.message && (
              <GovUK.ErrorText>{errors?.acceptsTerms.message}</GovUK.ErrorText>
            )}
            <GovUK.Checkbox
              type="checkbox"
              value="accept"
              {...register('acceptsTerms', {
                required: {
                  value: true,
                  message: t('form-required', {
                    ns: 'common'
                  })
                }
              })}
            >
              <GovUK.Paragraph>
                I agree for my details to be shared with energy suppliers and / or their
                delivery partners, as well as other government departments, to see if I
                qualify for the Energy Company Obligation (ECO4) scheme and / or The Great
                British Energy Scheme (GBIS) and, for any relevant services to be
                delivered.
              </GovUK.Paragraph>
              <GovUK.Paragraph>
                [Further information on our GDPR UK Privacy Policy.](#)
              </GovUK.Paragraph>
            </GovUK.Checkbox>
          </GovUK.Label>
        </GovUK.FormGroup>

        <Button type="submit">Submit</Button>
      </form>
    </div>
  )
}
