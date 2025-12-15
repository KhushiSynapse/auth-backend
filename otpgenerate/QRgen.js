const QRCode= require( "qrcode");
const fs= require( "fs");

const generateQR = async (text) => {
  try {
    // Generate QR code and save as PNG file
    await QRCode.toFile("qrcode.png", text, {
      color: {
        dark: "#000000", // QR code color
        light: "#FFFFFF", // Background color
      },
      width: 300, // size in pixels
    });
    console.log("QR code generated and saved as qrcode.png");
  } catch (err) {
    console.error(err);
  }
};

// Example usage
generateQR("https://example.com");
