# YOK Akademik MCP Server

A Model Context Protocol (MCP) server that provides tools for interacting with the YOK Akademik API. This server enables searching for academic profiles and analyzing collaborators in Turkish universities.

## Features

This MCP server provides the following tools:

### 🔍 `search_academic_profiles`
Search for academic profiles in Turkish universities using YOK Akademik API
- **Parameters:**
  - `name` (string): Name to search for (e.g., 'mert yıl')
  - `email` (string, optional): Email filter
  - `field_id` (number, optional): Field ID filter
  - `specialty_ids` (array of strings, optional): Specialty IDs filter

### 🤝 `get_academic_collaborators`
Get collaborators for a specific academic profile using YOK Akademik API
- **Parameters:**
  - `sessionId` (string): Session ID from search results
  - `profileId` (number): Profile ID to get collaborators for

### ℹ️ `get_yok_info`
Get information about YOK Akademik API and available features
- **Parameters:** None

## Installation

1. Navigate to the mcp directory:
```bash
cd mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Development

To run the server in development mode:
```bash
npm run dev
```

## Configuration

The server accepts the following configuration options:

- `baseUrl` (default: "http://91.99.144.40:3002"): Base URL for YOK Akademik API
- `timeout` (default: 30000): Request timeout in milliseconds

## Usage Examples

### Search for academic profiles
```
/search_academic_profiles name="mert yıl"
```

### Search with additional filters
```
/search_academic_profiles name="mert yıl" field_id=8 specialty_ids=["all"]
```

### Get collaborators for a profile
```
/get_academic_collaborators sessionId="session_1753701905_niig92wwj" profileId=4
```

### Get API information
```
/get_yok_info
```

## API Endpoints

The server integrates with the following YOK Akademik API endpoints:

- **Search:** `POST /api/search` - Search for academic profiles
- **Collaborators:** `POST /api/collaborators/{sessionId}` - Get collaborators for a profile

## Response Format

### Search Response
```json
{
  "success": true,
  "sessionId": "session_1753701905_niig92wwj",
  "profiles": [
    {
      "id": 1,
      "name": "MERT YILDIRIM",
      "title": "PROFESÖR",
      "url": "https://akademik.yok.gov.tr/...",
      "info": "PROFESÖR\nMERT YILDIRIM\nDÜZCE ÜNİVERSİTESİ/...",
      "photoUrl": "data:image/jpg;base64,...",
      "header": "DÜZCE ÜNİVERSİTESİ/MÜHENDİSLİK FAKÜLTESİ/...",
      "green_label": "Fen Bilimleri ve Matematik Temel Alanı",
      "blue_label": "Fizik",
      "keywords": "Yoğun Madde Fiziği ; Yarı İletkenler ; Malzeme Fiziği",
      "email": "mertyildirim@duzce.edu.tr"
    }
  ],
  "total_profiles": 12
}
```

### Collaborators Response
```json
{
  "success": true,
  "sessionId": "session_1753701905_niig92wwj",
  "profile": { /* profile object */ },
  "collaborators": [
    {
      "id": 1,
      "name": "ABDULLAH ÇAĞLAR",
      "title": "PROFESÖR",
      "info": "KOCAELİ ÜNİVERSİTESİ/...",
      "green_label": "Mühendislik Temel Alanı",
      "blue_label": "Gıda Bilimleri ve Mühendisliği",
      "keywords": "Süt ve Süt Ürünleri Teknolojisi, Gıda Mikrobiyolojisi",
      "photoUrl": "data:image/jpg;base64,...",
      "status": "completed",
      "deleted": false,
      "url": "https://akademik.yok.gov.tr/...",
      "email": "abdullah.caglar@kocaeli.edu.tr"
    }
  ],
  "total_collaborators": 4,
  "completed": true,
  "status": "✅ Scraping tamamlandı! 4 işbirlikçi bulundu.",
  "timestamp": 1753702225
}
```

## What is YOK Akademik?

YOK Akademik is a comprehensive database containing information about academics working in Turkish universities. The API provides:

- **Academic Profile Search**: Search by name, email, field, and specialty
- **Collaborator Analysis**: Analyze academic collaboration networks
- **Detailed Profile Information**: Title, institution, email, research areas

## Use Cases

1. **Academic Research**: Find academics working in specific fields
2. **Collaboration Analysis**: Analyze academic collaboration networks
3. **Network Mapping**: Understand the structure of academic communities
4. **Contact Information**: Find contact details for academics

## API Information

- **Base URL:** http://91.99.144.40:3002
- **Format:** JSON
- **Authentication:** Not required
- **Rate Limiting:** Not specified

This API is a powerful tool for understanding Turkey's academic research ecosystem and analyzing collaborations between academics.

## License

MIT 