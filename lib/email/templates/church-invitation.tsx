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

interface ChurchInvitationEmailProps {
  inviterName: string;
  inviterEmail: string;
  inviterPhone?: string;
  customMessage?: string;
  signupUrl: string;
  appName: string;
}

export const ChurchInvitationEmail = ({
  inviterName,
  inviterEmail,
  inviterPhone,
  customMessage,
  signupUrl,
  appName = "InHouse",
}: ChurchInvitationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        You've been invited to join {appName} as a church lead contact
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Church Invitation to {appName}</Heading>

          <Text style={text}>Hello,</Text>

          <Text style={text}>
            <strong>{inviterName}</strong> ({inviterEmail}) has invited your
            church to join {appName}, a platform that connects churches and
            helps members share resources within their community.
          </Text>

          {customMessage && (
            <Section style={messageSection}>
              <Text style={messageText}>
                <em>"{customMessage}"</em>
              </Text>
            </Section>
          )}

          <Text style={text}>As a church lead contact, you'll be able to:</Text>

          <ul style={list}>
            <li style={listItem}>
              Manage your church's profile and information
            </li>
            <li style={listItem}>Verify and approve church member requests</li>
            <li style={listItem}>
              Oversee resource sharing within your congregation
            </li>
            <li style={listItem}>Connect with other churches in your area</li>
          </ul>

          <Section style={buttonSection}>
            <Button style={button} href={signupUrl}>
              Accept Invitation & Setup Church
            </Button>
          </Section>

          <Text style={text}>
            If you have any questions, you can reach out to {inviterName}{" "}
            directly:
          </Text>

          <ul style={contactList}>
            <li style={listItem}>Email: {inviterEmail}</li>
            {inviterPhone && <li style={listItem}>Phone: {inviterPhone}</li>}
          </ul>

          <Text style={footerText}>
            This invitation will expire in 7 days. If you're not interested in
            joining {appName}, you can safely ignore this email.
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

const messageSection = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #e9ecef",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const messageText = {
  color: "#495057",
  fontSize: "16px",
  fontStyle: "italic",
  lineHeight: "24px",
  margin: "0",
};

const list = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
  paddingLeft: "20px",
};

const listItem = {
  margin: "8px 0",
};

const contactList = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "16px 0",
  paddingLeft: "20px",
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

const footerText = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "32px 0 0",
  textAlign: "center" as const,
};

export default ChurchInvitationEmail;
