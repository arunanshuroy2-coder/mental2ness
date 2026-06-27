import { getAccessToken } from "./auth";

export interface ContactItem {
  name: string;
  email: string;
  photoUrl: string;
  phone?: string;
}

/**
 * Fetches real contacts using the Google People API.
 */
export async function fetchGoogleContacts(): Promise<ContactItem[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("No active Google access token found. Please sign in.");
  }

  try {
    const url = "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,photos,phoneNumbers&pageSize=50";
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Google Contacts: ${res.statusText}`);
    }

    const data = await res.json();
    const connections = data.connections || [];

    return connections.map((conn: any) => {
      const name = conn.names?.[0]?.displayName || "Unnamed Connection";
      const email = conn.emailAddresses?.[0]?.value || "";
      const photoUrl = conn.photos?.[0]?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop";
      const phone = conn.phoneNumbers?.[0]?.value || undefined;

      return { name, email, photoUrl, phone };
    });
  } catch (error) {
    console.error("Error in fetchGoogleContacts:", error);
    throw error;
  }
}

/**
 * Creates a real Google Meet space instantly using the Google Meet API.
 */
export async function createGoogleMeetSpace(): Promise<{ meetingUri: string; meetingCode: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("No active Google access token found. Please sign in.");
  }

  try {
    // Post to the Google Meet REST API to create a new space
    const url = "https://meet.googleapis.com/v1/spaces";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const errDetails = await res.text();
      console.error("Meet Space Creation failed details:", errDetails);
      throw new Error(`Failed to create Meet Space: ${res.statusText}`);
    }

    const data = await res.json();
    // Return the meetingUri and code.
    // Schema of Space returned: { name: "spaces/...", meetingUri: "...", meetingCode: "..." }
    return {
      meetingUri: data.meetingUri || `https://meet.google.com/${data.meetingCode || "direct-session"}`,
      meetingCode: data.meetingCode || "N/A",
    };
  } catch (error) {
    console.error("Error in createGoogleMeetSpace:", error);
    throw error;
  }
}

/**
 * Sends a wellness checklist or message to a specific Google Chat Space.
 * The space ID should be in the format 'spaces/<SPACE_ID>' (e.g. 'spaces/AAAAxxxxxx')
 */
export async function sendGoogleChatMessage(spaceId: string, messageText: string): Promise<any> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("No active Google access token found. Please sign in.");
  }

  // Sanitize spaceId
  let formattedSpace = spaceId.trim();
  if (!formattedSpace.startsWith("spaces/")) {
    formattedSpace = `spaces/${formattedSpace}`;
  }

  try {
    const url = `https://chat.googleapis.com/v1/${formattedSpace}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: messageText,
      }),
    });

    if (!res.ok) {
      const errDetails = await res.text();
      throw new Error(`Google Chat Error: ${res.statusText} - ${errDetails}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error sending Google Chat message:", error);
    throw error;
  }
}
