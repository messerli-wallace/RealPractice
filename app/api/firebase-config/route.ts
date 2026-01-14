import { NextResponse } from "next/server";
import { getFirebaseServerConfig } from "../../../lib/config/firebaseConfig";

export async function GET() {
  try {
    // Get the server-side Firebase configuration
    const config = getFirebaseServerConfig();

    // Remove sensitive fields before sending to client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { apiKey, authDomain, ...safeConfig } = config;

    // In production, you might want to implement additional security measures:
    // 1. Rate limiting
    // 2. IP-based restrictions
    // 3. JWT validation for authenticated requests
    // 4. Domain restrictions

    return NextResponse.json({
      success: true,
      config: safeConfig,
      // Provide client-side configuration separately if needed
      clientConfig: {
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
        measurementId: config.measurementId,
      },
    });
  } catch (error) {
    console.error("Error fetching Firebase config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load configuration" },
      { status: 500 }
    );
  }
}
