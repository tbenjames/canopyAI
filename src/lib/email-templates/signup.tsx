import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  token?: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
  token,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{token ? `Your CanopyStride confirmation code is ${token}` : `Confirm your email for ${siteName}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>CanopyStride AI</Text>
        <Heading style={h1}>Confirm your email</Heading>
        <Text style={text}>
          Thanks for signing up for{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          !
        </Text>
        <Text style={text}>
          Please confirm your email address (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) by clicking the button below. If the app asks for a code, use the six digits shown here.
        </Text>
        {token ? <Text style={codeStyle}>{token}</Text> : null}
        <Button style={button} href={confirmationUrl}>Verify email</Button>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = {
  border: '1px solid #d8e4dc',
  borderRadius: '12px',
  margin: '24px auto',
  maxWidth: '520px',
  padding: '28px',
}
const brand = {
  color: '#1A3622',
  fontSize: '13px',
  fontWeight: 'bold' as const,
  letterSpacing: '0',
  margin: '0 0 14px',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#102318',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: '#3f4f46',
  lineHeight: '1.5',
  margin: '0 0 18px',
}
const link = { color: '#1A3622', textDecoration: 'underline' }
const codeStyle = {
  backgroundColor: '#f2f7f4',
  border: '1px solid #bfd3c5',
  borderRadius: '10px',
  color: '#1A3622',
  fontFamily: 'Courier, monospace',
  fontSize: '34px',
  fontWeight: 'bold' as const,
  letterSpacing: '8px',
  lineHeight: '1',
  margin: '20px 0',
  padding: '18px 20px',
  textAlign: 'center' as const,
}
const button = {
  backgroundColor: '#1A3622',
  color: '#ffffff',
  fontSize: '15px',
  borderRadius: '8px',
  padding: '13px 22px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#718078', lineHeight: '1.5', margin: '30px 0 0' }
