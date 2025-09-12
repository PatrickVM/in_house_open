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

interface MembershipWarningEmailProps {
  firstName?: string;
  daysRemaining: number;
  churchSearchUrl: string;
  supportEmail: string;
}

export const MembershipWarningEmail = ({
  firstName,
  daysRemaining,
  churchSearchUrl,
  supportEmail,
}: MembershipWarningEmailProps) => {
  const greeting = firstName ? `Hi ${firstName}` : "Hello";
  
  return (
    <Html>
      <Head />
      <Preview>Action Required: Church Membership Needed ({daysRemaining} Days Left)</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ Action Required</Heading>
          
          <Text style={text}>{greeting},</Text>
          
          <Text style={text}>
            Your InHouse account will be temporarily disabled in <strong>{daysRemaining} days</strong> 
            because you need to be a verified member of a church to access our platform.
          </Text>
          
          <Section style={warningBox}>
            <Text style={warningText}>
              <strong>What you need to do:</strong>
            </Text>
            <ol style={list}>
              <li>Search for and request to join a church</li>
              <li>Wait for church members to verify your request</li>
              <li>Your account stays active once you're verified!</li>
            </ol>
          </Section>
          
          <Section style={buttonSection}>
            <Button style={button} href={churchSearchUrl}>
              Find Churches Near Me
            </Button>
          </Section>
          
          <Text style={text}>
            If you have any questions, please contact us at {supportEmail}.
          </Text>
          
          <Text style={footerText}>
            This is an automated reminder. Your account will be disabled if no action is taken.
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
  color: "#d97706", // Warning orange
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

const warningBox = {
  backgroundColor: "#fef3c7", // Light yellow warning
  border: "1px solid #fbbf24",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const warningText = {
  color: "#92400e",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 12px 0",
};

const list = {
  color: "#92400e",
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
  backgroundColor: "#d97706",
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

export default MembershipWarningEmail;