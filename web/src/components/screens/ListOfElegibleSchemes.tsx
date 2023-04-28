import React from 'react'
import { useTranslation } from 'next-i18next'
import { Button } from '@/components/ui/Button'
import * as GovUK from 'govuk-react'

import RelatedItems from '../ui/RelatedItems'

export const ListOfElegibleSchemes = (props: { onSubmit: () => void }) => {
  const { t } = useTranslation(['screens'])
  return (
    <div>
      <GovUK.Heading size="L">{t('ListOfElegibleSchemes.title')}</GovUK.Heading>
      <GovUK.Paragraph>{t('ListOfElegibleSchemes.subTitle') as string}</GovUK.Paragraph>

      <RelatedItems>
        <GovUK.Caption size="M">
          {t('ListOfElegibleSchemes.suplier.header')}
        </GovUK.Caption>
        <GovUK.Heading size="M">{t('ListOfElegibleSchemes.suplier.title')}</GovUK.Heading>
        <GovUK.Paragraph>
          {t('ListOfElegibleSchemes.suplier.body1') as string}
        </GovUK.Paragraph>
        <GovUK.Paragraph>
          {t('ListOfElegibleSchemes.suplier.body2') as string}
        </GovUK.Paragraph>
      </RelatedItems>

      <Button
        type="button"
        onClick={() => {
          props.onSubmit()
        }}
      >
        {
          t('create-a-referral', {
            ns: 'common'
          }) as string
        }
      </Button>
    </div>
  )
}
