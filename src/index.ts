import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import axios from "axios";

// Configuration schema for the YOK Akademik MCP server
export const configSchema = z.object({
  baseUrl: z.string().default("http://91.99.144.40:3002").describe("Base URL for YOK Akademik API"),
  timeout: z.number().default(120000).describe("Request timeout in milliseconds (3 minutes)")
});

// Types for API responses
interface YOKProfile {
  id: number;
  name: string;
  title: string;
  url: string;
  info: string;
  photoUrl: string;
  header: string;
  green_label: string;
  blue_label: string;
  keywords: string;
  email: string;
}

interface YOKSearchResponse {
  success: boolean;
  sessionId: string;
  profiles: YOKProfile[];
  total_profiles: number;
}

interface YOKCollaborator {
  id: number;
  name: string;
  title: string;
  info: string;
  green_label: string;
  blue_label: string;
  keywords: string;
  photoUrl: string;
  status: string;
  deleted: boolean;
  url: string;
  email: string;
}

interface YOKCollaboratorsResponse {
  success: boolean;
  sessionId: string;
  profile: YOKProfile;
  collaborators: YOKCollaborator[];
  total_collaborators: number;
  completed: boolean;
  status: string;
  timestamp: number;
}

export default function ({ config }: { config: z.infer<typeof configSchema> }) {
  const server = new McpServer({
    name: "YOK Akademik MCP Server",
    version: "1.0.0",
  });

  // Tool: Search for academic profiles
  server.tool(
    "search_academic_profiles",
    "Search for academic profiles in Turkish universities using YOK Akademik API",
    {
      name: z.string().describe("Name to search for (e.g., 'mert yıl')"),
      email: z.string().optional().describe("Email filter (optional)"),
      field_id: z.number().optional().describe("Field ID filter (optional)"),
      specialty_ids: z.array(z.string()).optional().describe("Specialty IDs filter (optional, e.g., ['all'] or specific IDs)")
    },
    async ({ name, email, field_id, specialty_ids }: { 
      name: string; 
      email?: string; 
      field_id?: number; 
      specialty_ids?: string[] 
    }) => {
      try {
        const requestBody: any = { name };
        if (email) requestBody.email = email;
        if (field_id) requestBody.field_id = field_id;
        if (specialty_ids) requestBody.specialty_ids = specialty_ids;

        const response = await axios.post<YOKSearchResponse>(
          `${config.baseUrl}/api/search`,
          requestBody,
          {
            timeout: config.timeout,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const data = response.data;
        
        if (!data.success) {
          return {
            content: [
              {
                type: "text",
                text: "Error: Search request was not successful"
              }
            ]
          };
        }

        const profiles = data.profiles || [];
        const sessionId = data.sessionId;

        let result = "🔍 YOK Akademik Arama Sonuçları\n\n";
        result += `Aranan: ${name}\n`;
        result += `Toplam Sonuç: ${data.total_profiles}\n`;
        result += `Session ID: ${sessionId}\n\n`;

        if (profiles.length === 0) {
          result += "❌ Hiç sonuç bulunamadı.\n";
        } else {
          result += `📋 Bulunan Profiller (${profiles.length}):\n\n`;
          
          profiles.forEach((profile, index) => {
            result += `${index + 1}. ${profile.name} (ID: ${profile.id})\n`;
            result += `   📚 Unvan: ${profile.title}\n`;
            result += `   🏫 Kurum: ${profile.header}\n`;
            result += `   📧 E-posta: ${profile.email || 'Belirtilmemiş'}\n`;
            result += `   🏷️ Alan: ${profile.green_label || 'Belirtilmemiş'}\n`;
            result += `   🔬 Uzmanlık: ${profile.blue_label || 'Belirtilmemiş'}\n`;
            if (profile.keywords) {
              result += `   🔑 Anahtar Kelimeler: ${profile.keywords}\n`;
            }
            result += `   🔗 Profil: ${profile.url}\n\n`;
          });
        }

        return {
          content: [
            {
              type: "text",
              text: result
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
            }
          ]
        };
      }
    }
  );

  // Tool: Get collaborators for a specific profile
  server.tool(
    "get_academic_collaborators",
    "Get collaborators for a specific academic profile using YOK Akademik API",
    {
      sessionId: z.string().describe("Session ID from search results"),
      profileId: z.number().describe("Profile ID to get collaborators for")
    },
    async ({ sessionId, profileId }: { sessionId: string; profileId: number }) => {
      try {
        const response = await axios.post<YOKCollaboratorsResponse>(
          `${config.baseUrl}/api/collaborators/${sessionId}`,
          { profileId },
          {
            timeout: config.timeout,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const data = response.data;
        
        // Debug: API response'unu log et
        console.log("API Response:", JSON.stringify(data, null, 2));
        
        if (!data.success) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Hata: İşbirlikçi bilgileri alınamadı. API Response: ${JSON.stringify(data)}`
              }
            ]
          };
        }

        const profile = data.profile;
        const collaborators = data.collaborators || [];

        if (!profile) {
          return {
            content: [
              {
                type: "text",
                text: "❌ Hata: Profil bilgileri alınamadı. API response'unda profile objesi bulunamadı."
              }
            ]
          };
        }

        let result = "🤝 Akademik İşbirlikçi Analizi\n\n";
        result += `Ana Profil: ${profile.name} (ID: ${profile.id})\n`;
        result += `Unvan: ${profile.title}\n`;
        result += `Kurum: ${profile.header}\n`;
        result += `E-posta: ${profile.email || 'Belirtilmemiş'}\n`;
        result += `Alan: ${profile.green_label || 'Belirtilmemiş'}\n`;
        result += `Uzmanlık: ${profile.blue_label || 'Belirtilmemiş'}\n`;
        if (profile.keywords) {
          result += `Anahtar Kelimeler: ${profile.keywords}\n`;
        }
        result += `Profil URL: ${profile.url}\n\n`;

        result += "📊 İşbirlikçi Analizi:\n";
        result += `Toplam İşbirlikçi: ${data.total_collaborators}\n`;
        result += `Durum: ${data.status}\n`;
        result += `Tamamlanma: ${data.completed ? '✅ Tamamlandı' : '⏳ Devam ediyor'}\n\n`;

        if (collaborators.length === 0) {
          result += "❌ İşbirlikçi bulunamadı.\n";
        } else {
          result += `👥 İşbirlikçiler (${collaborators.length}):\n\n`;
          
          collaborators.forEach((collaborator, index) => {
            result += `${index + 1}. ${collaborator.name} (ID: ${collaborator.id})\n`;
            result += `   📚 Unvan: ${collaborator.title}\n`;
            result += `   🏫 Kurum: ${collaborator.info}\n`;
            result += `   📧 E-posta: ${collaborator.email || 'Belirtilmemiş'}\n`;
            result += `   🏷️ Alan: ${collaborator.green_label || 'Belirtilmemiş'}\n`;
            result += `   🔬 Uzmanlık: ${collaborator.blue_label || 'Belirtilmemiş'}\n`;
            if (collaborator.keywords) {
              result += `   🔑 Anahtar Kelimeler: ${collaborator.keywords}\n`;
            }
            result += `   🔗 Profil: ${collaborator.url}\n`;
            result += `   📊 Durum: ${collaborator.status}\n\n`;
          });
        }

        return {
          content: [
            {
              type: "text",
              text: result
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
            }
          ]
        };
      }
    }
  );

  // Tool: Get information about YOK Akademik API
  server.tool(
    "get_yok_info",
    "Get information about YOK Akademik API and available features",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: "YOK Akademik API Bilgileri\n\nYOK Akademik, Türkiye'deki üniversitelerde görev yapan akademisyenlerin bilgilerini içeren kapsamlı bir veritabanıdır.\n\nMevcut özellikler:\n- Akademisyen Arama (search_academic_profiles)\n- İşbirlikçi Analizi (get_academic_collaborators)\n\nAPI Endpoints:\n- POST /api/search\n- POST /api/collaborators/{sessionId}\n\nBase URL: http://91.99.144.40:3002"
          }
        ]
      };
    }
  );

  return server.server;
} 