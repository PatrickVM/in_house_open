import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  userName?: string;
  resetUrl: string;
  appName?: string;
}

export const PasswordResetEmail = ({
  userName,
  resetUrl,
  appName = "InHouse",
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password for {appName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset Your Password</Heading>

          <Text style={text}>
            {userName ? `Hi ${userName},` : "Hello,"}
          </Text>

          <Text style={text}>
            We received a request to reset your password for your {appName}{" "}
            account. Click the button below to create a new password:
          </Text>

          <Section style={buttonSection}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>

          <Text style={text}>
            This link will expire in <strong>1 hour</strong> for security
            reasons.
          </Text>

          <Section style={warningSection}>
            <Text style={warningText}>
              If you didn't request a password reset, you can safely ignore this
              email. Your password will remain unchanged.
            </Text>
          </Section>

          <Text style={footerText}>
            For security, this link can only be used once. If you need to reset
            your password again, please submit a new request.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#007cba",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const warningSection = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffc107",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const warningText = {
  color: "#856404",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

const footerText = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "32px 0 0",
  textAlign: "center" as const,
};

export default PasswordResetEmail;
