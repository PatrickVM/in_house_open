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

interface AccountDisabledEmailProps {
  firstName?: string;
  disabledReason: string;
  churchSearchUrl: string;
  supportEmail: string;
}

export const AccountDisabledEmail = ({
  firstName,
  disabledReason,
  churchSearchUrl,
  supportEmail,
}: AccountDisabledEmailProps) => {
  const greeting = firstName ? `Hi ${firstName}` : "Hello";
  
  return (
    <Html>
      <Head />
      <Preview>Account Temporarily Disabled - Church Membership Required</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Account Temporarily Disabled</Heading>
          
          <Text style={text}>{greeting},</Text>
          
          <Text style={text}>
            Your InHouse account has been temporarily disabled because you need to be 
            a verified member of a church to access our platform.
          </Text>
          
          <Section style={infoBox}>
            <Text style={infoTitle}>How to Reactivate Your Account:</Text>
            <ol style={list}>
              <li>Search for and request to join a church</li>
              <li>Wait for church members to verify your request</li> 
              <li>Your account will be automatically reactivated once verified</li>
            </ol>
          </Section>
          
          <Section style={buttonSection}>
            <Button style={button} href={churchSearchUrl}>
              Reactivate My Account
            </Button>
          </Section>
          
          <Text style={text}>
            Your account and all data remain secure. Once you become a verified church member,
            you'll regain full access immediately.
          </Text>
          
          <Text style={text}>
            Questions? Contact us at {supportEmail}.
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
  color: "#dc2626", // Red for disabled
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

const infoBox = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const infoTitle = {
  color: "#991b1b",
  fontSize: "16px",
  fontWeight: "bold",
  lineHeight: "24px",
  margin: "0 0 12px 0",
};

const list = {
  color: "#991b1b",
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
  backgroundColor: "#dc2626",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

export default AccountDisabledEmail;