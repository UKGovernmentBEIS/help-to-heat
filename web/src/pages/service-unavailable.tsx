import Layout from '@/components/Layout'
import { GridCol, GridRow, H1 } from 'govuk-react'
import * as GovUK from 'govuk-react'

import React from 'react'

const NextPage = () => {
  return (
    <Layout>
      <GridRow>
        <GridCol setWidth="three-thirds">
          <H1 size={'L'}>The [X] service is currently unavailable</H1>
          <GovUK.Paragraph>We apologise for the inconvenience.</GovUK.Paragraph>
        </GridCol>
      </GridRow>
    </Layout>
  )
}

export default NextPage
