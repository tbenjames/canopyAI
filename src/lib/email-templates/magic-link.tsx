import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
  token?: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
  token,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{token ? `Your CanopyStride verification code is ${token}` : `Your secure login link for ${siteName}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>CanopyStride AI</Text>
        <Heading style={h1}>Verify your sign-in</Heading>
        <Text style={text}>
          Use this secure email to finish signing in to {siteName}. You can enter the
          code in the app or click the button below.
        </Text>
        {token ? <Text style={codeStyle}>{token}</Text> : null}
        <Button style={button} href={confirmationUrl}>Log in securely</Button>
        <Text style={hint}>This code and link expire shortly for your protection.</Text>
        <Text style={footer}>
          If you didn't request this link, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
const hint = { fontSize: '13px', color: '#65746b', margin: '18px 0 0' }
const footer = { fontSize: '12px', color: '#718078', lineHeight: '1.5', margin: '30px 0 0' }
