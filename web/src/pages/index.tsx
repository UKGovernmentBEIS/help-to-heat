import Layout from '@/components/Layout'
import { GridCol, GridRow, H1 } from 'govuk-react'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import * as GovUK from 'govuk-react'

import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const NextPage = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter()
  const { t } = useTranslation(['common'])

  useEffect(() => {
    router.prefetch('/questionnaire')
  }, [router])
  return (
    <Layout>
      <GridRow>
        <GridCol setWidth="two-thirds">
          <H1 size={'L'}>{t('title')}</H1>
          <GovUK.Paragraph>
            Use this service to see if you qualify for installing energy-saving measures
            to your home through the Government’s Energy Company Obligation (ECO4) or
            Great British Insulation Scheme (GBIS).
          </GovUK.Paragraph>
          <GovUK.InsetText>
            <GovUK.Link href="#">
              Find out more about the Energy Company Obligation.
            </GovUK.Link>

            <div
              style={{
                marginBottom: '16px'
              }}
            ></div>

            <GovUK.Link href="#">
              Find out more about the Great British Insulation Scheme.
            </GovUK.Link>
          </GovUK.InsetText>
          <GovUK.H3>Use this service to:</GovUK.H3>
          <GovUK.UnorderedList listStyleType="bullet">
            <GovUK.ListItem>
              check if your household and property may be able to qualify for ECO4 or the
              GBIS
            </GovUK.ListItem>
            <GovUK.ListItem>create a referral to an energy supplier</GovUK.ListItem>
          </GovUK.UnorderedList>
          <GovUK.H3>Who can use this service</GovUK.H3>
          <GovUK.UnorderedList listStyleType="bullet">
            <GovUK.ListItem>homeowners</GovUK.ListItem>
            <GovUK.ListItem>
              tenants who rent from a private landlord or estate agent
            </GovUK.ListItem>
            <GovUK.ListItem>tenants who live in social housing</GovUK.ListItem>
          </GovUK.UnorderedList>

          <GovUK.Paragraph>
            Tenants will need permissions from their landlords to use this service.
          </GovUK.Paragraph>

          <GovUK.H3>Energy-saving measures you could qualify for includes</GovUK.H3>
          <GovUK.UnorderedList listStyleType="bullet">
            <GovUK.ListItem>cavity or solid wall insulation</GovUK.ListItem>
            <GovUK.ListItem>external wall insulation</GovUK.ListItem>
            <GovUK.ListItem>loft insulation</GovUK.ListItem>
            <GovUK.ListItem>flat or pitched roof insulation</GovUK.ListItem>
            <GovUK.ListItem>park home insulation</GovUK.ListItem>
          </GovUK.UnorderedList>

          <GovUK.H3>What happens once you create a referral:</GovUK.H3>
          <GovUK.UnorderedList listStyleType="bullet">
            <GovUK.ListItem>
              The energy supplier will contact you within 10 working days
            </GovUK.ListItem>
            <GovUK.ListItem>
              They will assess the property and determine the most energy-efficient
              measures that you qualify for
            </GovUK.ListItem>
            <GovUK.ListItem>
              They will install the agreed measures at a lower cost to you
            </GovUK.ListItem>
          </GovUK.UnorderedList>

          <GovUK.H3>Before you start:</GovUK.H3>

          <GovUK.Paragraph>You will be asked for information about:</GovUK.Paragraph>

          <GovUK.UnorderedList listStyleType="bullet">
            <GovUK.ListItem>your household income</GovUK.ListItem>
            <GovUK.ListItem>
              any benefits you, or anyone in your household receives
            </GovUK.ListItem>
            <GovUK.ListItem>the council tax band of the property</GovUK.ListItem>
            <GovUK.ListItem>
              details of the walls and insulation in the property
            </GovUK.ListItem>
          </GovUK.UnorderedList>

          <GovUK.Paragraph>
            If you are unsure about your EPC rating or council tax band, this service can
            help you find that information.
          </GovUK.Paragraph>

          <GovUK.Paragraph>
            You will be asked to give permission to pass your details onto a supplier that
            you choose before you are referred. If you do not want to supply your
            information or go forward with the application, you can close the tool at any
            time before confirming and submitting.
          </GovUK.Paragraph>

          <GovUK.Paragraph mb={0}>Telephone: 0800 098 7950</GovUK.Paragraph>
          <GovUK.Paragraph mb={0}>
            Telephone: 0800 098 7950 Monday to Friday, 8am to 6pm (except bank holidays)
          </GovUK.Paragraph>
          <GovUK.Paragraph mb={0}>Saturday, 9am to 12pm</GovUK.Paragraph>
          <GovUK.Paragraph mb={8}>[Find out about call charges](#)</GovUK.Paragraph>

          <Button
            start
            onClick={() => {
              router.push('/questionnaire')
            }}
          >
            {t('start-now')}
          </Button>
        </GridCol>
        <GridCol setWidth="one-third">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              fontSize: '14px'
            }}
          >
            <Link href="/" locale="en">
              English locale
            </Link>
            <Link href="/" locale="cy">
              Welsh locale
            </Link>
          </div>
        </GridCol>
      </GridRow>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const translations = await serverSideTranslations(locale || 'en', ['common'])

  return {
    props: {
      ...translations
    }
  }
}

export default NextPage
