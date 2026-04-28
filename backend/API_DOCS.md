# FlowForge Backend API Documentation

Base URL: `http://localhost:3000/api/v1`

## Forms API

### 1. Create a Form
**Endpoint**: `POST /forms`

**Payload**:
```json
{
  "name": "User Registration",
  "schema": {
    "fields": [
      {
        "id": "2834a404-87cd-4296-97a8-c3372cd3dfb2",
        "type": "text",
        "label": "Full Name",
        "name": "full_name",
        "required": true,
        "placeholder": "Enter your name..."
      }
    ]
  }
}
```

### 2. Get All Forms
**Endpoint**: `GET /forms`

### 3. Get Single Form
**Endpoint**: `GET /forms/:id`

### 4. Update Form
**Endpoint**: `PUT /forms/:id`

**Payload**:
```json
{
  "name": "Updated Form Name"
}
```

### 5. Delete Form
**Endpoint**: `DELETE /forms/:id`
