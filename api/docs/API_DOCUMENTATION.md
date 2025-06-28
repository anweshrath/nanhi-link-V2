# Nanhi.Links API Documentation

## Overview

The Nanhi.Links API provides programmatic access to URL shortening, link management, and analytics features. This RESTful API allows developers to integrate Nanhi.Links functionality into their applications, websites, and services.

**Base URL:** `https://api.nanhi.link/api`  
**Version:** 1.0.0  
**Authentication:** API Key

---

## Authentication

All API requests require authentication using an API key. Include your API key in the request headers:

```http
X-API-Key: your_api_key_here
```

Or as a query parameter:

```http
GET /api/links?api_key=your_api_key_here
```

### Generate API Key

**Endpoint:** `POST /auth/generate-key`

Generate an API key using your Nanhi.Links account credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "api_key": "abc123def456...",
  "message": "API key generated successfully"
}
```

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP address
- **Headers:** Rate limit information is included in response headers
- **Exceeded:** Returns `429 Too Many Requests`

---

## Endpoints

### Health Check

**Endpoint:** `GET /health`  
**Authentication:** Not required

Check API server status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

### Links Management

#### Create Short Link

**Endpoint:** `POST /links`  
**Authentication:** Required

Create a new short link.

**Request Body:**
```json
{
  "url": "https://example.com/very-long-url",
  "custom_code": "my-link",
  "title": "My Example Link",
  "description": "This is an example link",
  "project_id": "uuid-here",
  "expires_at": "2024-12-31T23:59:59Z",
  "click_limit": 1000,
  "password": "optional-password"
}
```

**Required Fields:**
- `url` (string): The destination URL to shorten

**Optional Fields:**
- `custom_code` (string): Custom short code (auto-generated if not provided)
- `title` (string): Link title for organization
- `description` (string): Link description
- `project_id` (string): UUID of the project to associate with
- `expires_at` (string): ISO 8601 expiration date
- `click_limit` (number): Maximum number of clicks allowed
- `password` (string): Password protection for the link

**Response:**
```json
{
  "id": "uuid-here",
  "short_code": "abc123",
  "short_url": "https://nanhi.link/abc123",
  "url": "https://example.com/very-long-url",
  "title": "My Example Link",
  "description": "This is an example link",
  "created_at": "2024-01-15T10:30:00.000Z",
  "expires_at": "2024-12-31T23:59:59Z",
  "click_limit": 1000,
  "is_active": true
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid URL
- `409 Conflict`: Custom code already exists
- `500 Internal Server Error`: Failed to create link

---

#### Get Links

**Endpoint:** `GET /links`  
**Authentication:** Required

Retrieve user's links with pagination and filtering.

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 50, max: 100): Links per page
- `project_id` (string): Filter by project ID
- `search` (string): Search in title and URL

**Example:**
```http
GET /api/links?page=1&limit=20&project_id=uuid-here&search=example
```

**Response:**
```json
{
  "links": [
    {
      "id": "uuid-here",
      "short_code": "abc123",
      "short_url": "https://nanhi.link/abc123",
      "url": "https://example.com/very-long-url",
      "title": "My Example Link",
      "description": "This is an example link",
      "created_at": "2024-01-15T10:30:00.000Z",
      "expires_at": null,
      "click_limit": null,
      "is_active": true,
      "click_count": 42,
      "projects": {
        "id": "project-uuid",
        "name": "My Project",
        "color": "#8B5CF6"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

#### Get Specific Link

**Endpoint:** `GET /links/:id`  
**Authentication:** Required

Retrieve details of a specific link.

**Response:**
```json
{
  "id": "uuid-here",
  "short_code": "abc123",
  "short_url": "https://nanhi.link/abc123",
  "url": "https://example.com/very-long-url",
  "title": "My Example Link",
  "description": "This is an example link",
  "created_at": "2024-01-15T10:30:00.000Z",
  "expires_at": null,
  "click_limit": null,
  "is_active": true,
  "click_count": 42,
  "projects": {
    "id": "project-uuid",
    "name": "My Project",
    "color": "#8B5CF6"
  }
}
```

**Error Responses:**
- `404 Not Found`: Link not found or not owned by user

---

#### Update Link

**Endpoint:** `PUT /links/:id`  
**Authentication:** Required

Update an existing link.

**Request Body:**
```json
{
  "url": "https://updated-example.com",
  "title": "Updated Title",
  "description": "Updated description",
  "expires_at": "2024-12-31T23:59:59Z",
  "click_limit": 2000,
  "password": "new-password",
  "is_active": false
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response:**
```json
{
  "id": "uuid-here",
  "short_code": "abc123",
  "short_url": "https://nanhi.link/abc123",
  "url": "https://updated-example.com",
  "title": "Updated Title",
  "description": "Updated description",
  "created_at": "2024-01-15T10:30:00.000Z",
  "expires_at": "2024-12-31T23:59:59Z",
  "click_limit": 2000,
  "is_active": false
}
```

---

#### Delete Link

**Endpoint:** `DELETE /links/:id`  
**Authentication:** Required

Delete a link permanently.

**Response:**
```json
{
  "message": "Link deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: Link not found or not owned by user

---

#### Bulk Create Links

**Endpoint:** `POST /links/bulk`  
**Authentication:** Required

Create multiple links in a single request (max 100).

**Request Body:**
```json
{
  "links": [
    {
      "url": "https://example1.com",
      "title": "Link 1",
      "custom_code": "link1"
    },
    {
      "url": "https://example2.com",
      "title": "Link 2",
      "project_id": "project-uuid"
    }
  ]
}
```

**Response:**
```json
{
  "success_count": 2,
  "error_count": 0,
  "results": [
    {
      "index": 0,
      "success": true,
      "link": {
        "id": "uuid-1",
        "short_code": "link1",
        "short_url": "https://nanhi.link/link1",
        "url": "https://example1.com",
        "title": "Link 1"
      }
    },
    {
      "index": 1,
      "success": true,
      "link": {
        "id": "uuid-2",
        "short_code": "abc456",
        "short_url": "https://nanhi.link/abc456",
        "url": "https://example2.com",
        "title": "Link 2"
      }
    }
  ],
  "errors": []
}
```

---

### Analytics

#### Get Link Analytics

**Endpoint:** `GET /links/:id/analytics`  
**Authentication:** Required

Retrieve detailed analytics for a specific link.

**Query Parameters:**
- `period` (string): Time period (`24h`, `7d`, `30d`, `90d`, default: `7d`)

**Example:**
```http
GET /api/links/uuid-here/analytics?period=30d
```

**Response:**
```json
{
  "link": {
    "id": "uuid-here",
    "short_code": "abc123",
    "title": "My Example Link"
  },
  "period": "30d",
  "total_clicks": 156,
  "clicks_by_date": {
    "2024-01-01": 12,
    "2024-01-02": 8,
    "2024-01-03": 15
  },
  "clicks_by_country": {
    "United States": 89,
    "Canada": 23,
    "United Kingdom": 18,
    "Germany": 12,
    "France": 8
  },
  "clicks_by_device": {
    "Desktop": 78,
    "Mobile": 65,
    "Tablet": 13
  },
  "clicks_by_referrer": {
    "Direct": 45,
    "Google": 32,
    "Twitter": 28,
    "Facebook": 21,
    "LinkedIn": 15
  },
  "recent_clicks": [
    {
      "timestamp": "2024-01-15T10:30:00.000Z",
      "country": "United States",
      "device": "Desktop",
      "referrer": "Google",
      "ip": "192.168.1..."
    }
  ]
}
```

---

### Projects

#### Get Projects

**Endpoint:** `GET /projects`  
**Authentication:** Required

Retrieve user's projects.

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid-here",
      "name": "My Website",
      "description": "Links for my personal website",
      "color": "#8B5CF6",
      "created_at": "2024-01-15T10:30:00.000Z",
      "link_count": 25
    }
  ]
}
```

---

#### Create Project

**Endpoint:** `POST /projects`  
**Authentication:** Required

Create a new project.

**Request Body:**
```json
{
  "name": "My New Project",
  "description": "Project description",
  "color": "#10B981",
  "destination_url": "https://example.com"
}
```

**Required Fields:**
- `name` (string): Project name
- `destination_url` (string): Default destination URL for the project

**Optional Fields:**
- `description` (string): Project description
- `color` (string): Hex color code for the project

**Response:**
```json
{
  "id": "uuid-here",
  "name": "My New Project",
  "description": "Project description",
  "color": "#10B981",
  "destination_url": "https://example.com",
  "created_at": "2024-01-15T10:30:00.000Z",
  "link_count": 0
}
```

---

### Statistics

#### Get User Statistics

**Endpoint:** `GET /stats`  
**Authentication:** Required

Get overview statistics for the authenticated user.

**Response:**
```json
{
  "total_links": 150,
  "active_links": 142,
  "total_clicks": 5420,
  "total_projects": 8,
  "clicks_today": 23
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_ERROR_CODE"
}
```

### Common Error Codes

- `MISSING_API_KEY`: API key not provided
- `INVALID_API_KEY`: API key is invalid or expired
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `MISSING_URL`: Required URL parameter not provided
- `INVALID_URL`: URL format is invalid
- `CODE_EXISTS`: Custom short code already exists
- `LINK_NOT_FOUND`: Requested link not found
- `CREATION_ERROR`: Failed to create resource
- `UPDATE_ERROR`: Failed to update resource
- `DELETION_ERROR`: Failed to delete resource
- `RETRIEVAL_ERROR`: Failed to retrieve data
- `ANALYTICS_ERROR`: Failed to retrieve analytics
- `INTERNAL_ERROR`: Internal server error

---

## HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate short code)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## SDKs and Libraries

### JavaScript/Node.js

```javascript
const NanhiLinks = require('nanhi-links-sdk');

const client = new NanhiLinks({
  apiKey: 'your_api_key_here',
  baseUrl: 'https://api.nanhi.link/api'
});

// Create a short link
const link = await client.links.create({
  url: 'https://example.com/very-long-url',
  title: 'My Example Link'
});

console.log(link.short_url); // https://nanhi.link/abc123
```

### Python

```python
from nanhi_links import NanhiLinksClient

client = NanhiLinksClient(api_key='your_api_key_here')

# Create a short link
link = client.links.create(
    url='https://example.com/very-long-url',
    title='My Example Link'
)

print(link.short_url)  # https://nanhi.link/abc123
```

### PHP

```php
<?php
require_once 'vendor/autoload.php';

use NanhiLinks\Client;

$client = new Client('your_api_key_here');

// Create a short link
$link = $client->links->create([
    'url' => 'https://example.com/very-long-url',
    'title' => 'My Example Link'
]);

echo $link->short_url; // https://nanhi.link/abc123
?>
```

---

## Webhooks

Configure webhooks to receive real-time notifications about link events.

### Supported Events

- `link.created`: New link created
- `link.clicked`: Link was clicked
- `link.updated`: Link was updated
- `link.deleted`: Link was deleted

### Webhook Payload

```json
{
  "event": "link.clicked",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "link": {
      "id": "uuid-here",
      "short_code": "abc123",
      "url": "https://example.com"
    },
    "click": {
      "country": "United States",
      "device": "Desktop",
      "referrer": "Google"
    }
  }
}
```

---

## Examples

### Basic Link Shortening

```bash
curl -X POST https://api.nanhi.link/api/links \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/very-long-url",
    "title": "My Example Link"
  }'
```

### Get Link Analytics

```bash
curl -X GET "https://api.nanhi.link/api/links/uuid-here/analytics?period=30d" \
  -H "X-API-Key: your_api_key_here"
```

### Bulk Create Links

```bash
curl -X POST https://api.nanhi.link/api/links/bulk \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "links": [
      {
        "url": "https://example1.com",
        "title": "Link 1"
      },
      {
        "url": "https://example2.com",
        "title": "Link 2"
      }
    ]
  }'
```

---

## Support

- **Documentation:** https://docs.nanhi.link
- **Support Email:** support@nanhi.link
- **Status Page:** https://status.nanhi.link
- **GitHub:** https://github.com/nanhi-links/api

---

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Basic link management endpoints
- Analytics endpoints
- Project management
- Bulk operations
- Rate limiting and authentication
