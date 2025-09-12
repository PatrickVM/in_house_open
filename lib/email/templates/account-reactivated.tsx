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

interface AccountReactivatedEmailProps {
  firstName?: string;
  churchName: string;
  loginUrl: string;
}

export const AccountReactivatedEmail = ({
  firstName,
  churchName,
  loginUrl,
}: AccountReactivatedEmailProps) => {
  const greeting = firstName ? `Hi ${firstName}` : "Hello";
  
  return (
    <Html>
      <Head />
      <Preview>🎉 Welcome Back - Your Account Has Been Reactivated!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Welcome Back!</Heading>
          
          <Text style={text}>{greeting},</Text>
          
          <Text style={text}>
            Great news! Your InHouse account has been automatically reactivated because 
            you are now a verified member of <strong>{churchName}</strong>.
          </Text>
          
          <Section style={successBox}>
            <Text style={successText}>
              <strong>You now have full access to:</strong>
            </Text>
            <ul style={list}>
              <li>Browse and claim items in your church community</li>
              <li>Share resources with fellow church members</li>
              <li>Participate in church activities and messages</li>
              <li>Connect with other verified members</li>
            </ul>
          </Section>
          
          <Section style={buttonSection}>
            <Button style={button} href={loginUrl}>
              Access Your Account
            </Button>
          </Section>
          
          <Text style={text}>
            Thank you for completing the church membership verification process. 
            We're excited to have you as part of the InHouse community!
          </Text>
          
          <Text style={footerText}>
            Welcome back to InHouse - connecting churches, one community at a time.
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
  color: "#16a34a", // Green for success
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const successBox = {
  backgroundColor: "#f0fdf4", // Light green success
  border: "1px solid #bbf7d0",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const successText = {
  color: "#166534",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 12px 0",
};

const list = {
  color: "#166534",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "8px 0",
  paddingLeft: "20px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#16a34a",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footerText = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "32px 0 0",
  textAlign: "center" as const,
};

export default AccountReactivatedEmail;