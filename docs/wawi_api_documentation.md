# JTL-WAWI API Documentation

## Overview
The JTL-WAWI API (Cloud) version 1.0 provides a comprehensive REST interface for interacting with the JTL Wawi ERP system. This API is used by the demoApp to retrieve and manage items, customers, and categories.

## API Location
The OpenAPI specification file is located at `_files/wawiApi_openapi.json` in the repository.

## Key Entities
The API provides access to the following key entities:
- Items (products)
- Categories
- Customers
- Suppliers
- Companies
- Orders

## Authentication
The API uses OAuth2 for authentication. The demoApp implements this authentication flow through:
1. The backend's token manager (`backend/src/lib/auth/tokenManager.ts`)
2. Session token verification (`backend/src/lib/auth/sessionTokenVerifier.ts`)
3. The frontend's bridge service (`frontend/src/lib/bridgeService.ts`)

## How the demoApp Uses the API
- **Item Management**: The app retrieves, creates, and updates items through the `/api/erp/items` endpoint
- **Category Management**: Categories are fetched and used for item categorization through the `/api/erp/categories` endpoint
- **Customer Management**: Customer data is retrieved and managed through customer-related endpoints

## Integration Pattern
The demoApp follows a proxy pattern where:
1. Frontend components make requests to the backend
2. The backend proxies these requests to the JTL Wawi API
3. Authentication tokens are managed and refreshed automatically

## API Endpoints
The API includes endpoints for:
- Authentication
- Item management
- Category management
- Customer management
- Order processing
- Supplier management
- And many more ERP-related functions

For a complete list of endpoints and schemas, refer to the full OpenAPI specification file.
