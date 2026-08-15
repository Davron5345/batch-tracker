import QRCode from "qrcode";

export function batchPublicUrl(token: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  return `${base}/b/${token}`;
}

export async function generateQrDataUrl(token: string): Promise<string> {
  return QRCode.toDataURL(batchPublicUrl(token), {
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}

export async function generateQrPngBuffer(token: string): Promise<Buffer> {
  return QRCode.toBuffer(batchPublicUrl(token), {
    type: "png",
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}
