import React, { useEffect } from 'react'
import * as GovUK from 'govuk-react'
import { useTranslation } from 'next-i18next'

export const Success = (props: { referenceNumber: string }) => {
  const { t } = useTranslation(['screens'])

  useEffect(() => {
    localStorage.removeItem('qs')
  }, [])

  return (
    <div data-cy="success">
      <GovUK.Panel title="Your details have been submitted to Octopus Energy">
        Reference code: X546RGJ
        <br />
        <strong>{props.referenceNumber}</strong>
      </GovUK.Panel>

      <GovUK.H3>What happens next</GovUK.H3>
      <GovUK.Paragraph>
        Octopus Energy will process your details and contact you by email within 10
        working days. If Octopus Energy has not reached out by then, you can contact them
        directly:
      </GovUK.Paragraph>
      <GovUK.Paragraph>
        [eco4@octopusenergy.co.uk](mailto:eco4@octopusenergy.co.uk)
      </GovUK.Paragraph>
      <GovUK.Paragraph>
        Please do not create another referral on the system as this may affect the service
        you get. You can contact the supplier directly if you have any questions.
      </GovUK.Paragraph>
      <GovUK.Paragraph>
        For now, you can visit [www.octupus.energy](https://www.octupus.energy) to find
        other ways to improve energy efficiency at home.
      </GovUK.Paragraph>

      <GovUK.H3>More help</GovUK.H3>
      <GovUK.Paragraph>
        If you want to make more immediate changes to how you could save energy in your
        home
      </GovUK.Paragraph>

      <GovUK.UnorderedList listStyleType="bullet">
        <GovUK.ListItem>
          <GovUK.Paragraph>
            visit [Find ways to save energy in your home](#) to discover how you can keep
            your home warm.
          </GovUK.Paragraph>
        </GovUK.ListItem>
        <GovUK.ListItem>
          <GovUK.Paragraph>
            visit the [Energy Savings Trust](#), [Ofgem](#) or [Citizen’s Advice](#) for
            energy-saving tips
          </GovUK.Paragraph>
        </GovUK.ListItem>
        <GovUK.ListItem>
          contact your energy supplier for useful information
        </GovUK.ListItem>
      </GovUK.UnorderedList>
    </div>
  )
}
