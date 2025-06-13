import QRCode from "qrcode";

/**
 * Generate a QR code data URL for an invite code
 */
export async function generateQRCode(inviteCode: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/register/${inviteCode}`;

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(inviteUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(inviteCode: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/register/${inviteCode}`;

  try {
    const qrCodeSVG = await QRCode.toString(inviteUrl, {
      type: "svg",
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });

    return qrCodeSVG;
  } catch (error) {
    console.error("Error generating QR code SVG:", error);
    throw new Error("Failed to generate QR code SVG");
  }
}

/**
 * Get the invite URL for a given invite code
 */
export function getInviteUrl(inviteCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/register/${inviteCode}`;
}
