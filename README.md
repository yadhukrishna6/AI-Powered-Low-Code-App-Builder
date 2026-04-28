# AI-Powered Low-Code App Builder

Enterprise-grade full stack monorepo for AI-Powered Low-Code App Builder — an AI-powered low-code app builder.

## Recommended Monorepo Structure

```
ai-powered-low-code-app-builder/
├── README.md
├── docker-compose.yml
├── .gitignore
├── frontend/
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.base.json
│   ├── tsconfig.json
│   ├── nx.json (optional)
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth-routing.module.ts
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── dashboard-routing.module.ts
│   │   │   │   │   ├── dashboard.module.ts
│   │   │   │   ├── form-builder/
│   │   │   │   │   ├── form-builder-routing.module.ts
│   │   │   │   │   ├── form-builder.module.ts
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── containers/
│   │   │   │   │   ├── services/
│   │   │   │   ├── dynamic-form-renderer/
│   │   │   │   │   ├── dynamic-form-renderer-routing.module.ts
│   │   │   │   │   ├── dynamic-form-renderer.module.ts
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── services/
│   │   │   │   ├── workflow-engine/
│   │   │   │   │   ├── workflow-engine-routing.module.ts
│   │   │   │   │   ├── workflow-engine.module.ts
│   │   │   │   │   ├── designer/
│   │   │   │   │   ├── execution/
│   │   │   │   ├── shared/
│   │   │   │   │   ├── shared.module.ts
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── directives/
│   │   │   │   │   ├── pipes/
│   │   │   │   │   ├── ui/
│   │   │   │   ├── core/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── guards/
│   │   │   │   │   ├── interceptors/
│   │   │   │   │   ├── models/
│   │   │   │   │   ├── state/
│   │   │   │   │   ├── config/
│   │   │   │   │   └── api/
│   │   │   │   ├── layouts/
│   │   │   │   │   ├── shell/
│   │   │   │   │   ├── auth-layout/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── home/
│   │   │   │   │   ├── not-found/
│   │   │   │   │   ├── settings/
│   │   │   ├── assets/
│   │   │   │   ├── schemas/
│   │   │   │   │   ├── forms/
│   │   │   │   │   ├── workflows/
│   │   │   │   │   └── ui/
│   │   │   ├── environments/
│   │   │   │   ├── environment.ts
│   │   │   │   ├── environment.prod.ts
│   │   ├── index.html
│   │   └── main.ts
│   ├── e2e/
│   └── tsconfig.app.json
├── backend/
│   ├── pom.xml
│   ├── docker/
│   │   ├── Dockerfile.auth-service
│   │   ├── Dockerfile.form-service
│   │   └── Dockerfile.workflow-service
│   ├── auth-service/
│   │   ├── pom.xml
│   │   ├── src/main/java/com/aipoweredlowcode/app/auth/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── mapper/
│   │   │   ├── config/
│   │   │   ├── security/
│   │   │   └── exception/
│   │   ├── src/main/resources/
│   │   └── src/test/java/com/flowforge/auth/
│   ├── form-service/
│   │   ├── pom.xml
│   │   ├── src/main/java/com/aipoweredlowcode/app/form/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── mapper/
│   │   │   ├── config/
│   │   │   └── exception/
│   │   ├── src/main/resources/
│   │   └── src/test/java/com/flowforge/form/
│   ├── workflow-service/
│   │   ├── pom.xml
│   │   ├── src/main/java/com/aipoweredlowcode/app/workflow/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── mapper/
│   │   │   ├── config/
│   │   │   └── exception/
│   │   ├── src/main/resources/
│   │   └── src/test/java/com/flowforge/workflow/
│   └── common/
│       ├── pom.xml
│       ├── src/main/java/com/flowforge/common/
│       │   ├── dto/
│       │   ├── exception/
│       │   ├── config/
│       │   ├── security/
│       │   └── util/
│       └── src/test/java/com/flowforge/common/
```

## Architecture Explanation

### Frontend

- `src/app/modules`: feature modules isolate business domains and support lazy loading.
- `core`: low-level services, auth guards, interceptors, app-wide models, and API wiring.
- `shared`: reusable UI components, form field components, pipes, and directives.
- `assets/schemas`: versioned JSON schema definitions driving the dynamic form renderer.
- `environments`: environment-specific API endpoints and feature flags.
- `models`: shared TypeScript DTOs for strong typing across modules.
- `state`: placeholder for NgRx stores, actions, selectors, and effects.

#### Key frontend concepts

- Metadata-driven form rendering: `dynamic-form-renderer` reads JSON schemas from `assets/schemas` or backend metadata service.
- Drag-and-drop builder: `form-builder` module provides canvas, palette, and layout engines; stores schema in a normalized state.
- Workflow designer: `workflow-engine` provides a visual graph editor and execution pipeline orchestration.
- Reusable field components: `shared/components/fields` should include `text-field`, `email-field`, `date-field`, plus wrapper components for repeatable dynamic widgets.
- API integration layer: `core/api` contains typed HTTP service wrappers, where each feature module injects service facades.
- Lazy loading: each major feature module is lazy-loaded from `app-routing.module.ts`.

### Backend

- Multi-module Quarkus backend using a parent `pom.xml` and child modules for each microservice.
- `auth-service`: token/identity, login, register, user management.
- `form-service`: form schema storage, field definitions, form metadata, submission capture.
- `workflow-service`: workflow definitions, execution state, triggers, approvals.
- `common`: shared DTOs, exception handling, security utilities, and common config.
- Each service contains clean packages for controller, service, repository, dto, entity, mapper, config, security, and exception.
- `docker/` stores service Dockerfiles and environment-specific container artifacts.

## Database Design Structure

### Forms Domain

- `forms`
  - `form_id`, `name`, `description`, `version`, `status`, `created_by`, `created_at`, `updated_at`
- `fields`
  - `field_id`, `form_id`, `name`, `type`, `label`, `order_index`, `required`, `metadata`
- `submissions`
  - `submission_id`, `form_id`, `user_id`, `payload`, `status`, `submitted_at`

### Workflow Domain

- `workflows`
  - `workflow_id`, `name`, `description`, `status`, `created_by`, `updated_at`
- `workflow_steps`
  - `step_id`, `workflow_id`, `step_type`, `name`, `configuration`, `order_index`
- `workflow_instances`
  - `instance_id`, `workflow_id`, `status`, `context`, `started_at`, `completed_at`

### Auth / User Domain

- `users`
  - `user_id`, `username`, `email`, `password_hash`, `roles`, `status`, `created_at`
- `roles`
  - `role_id`, `name`, `permissions`

## Recommended Tech Stack

- Frontend
  - Angular 19+ with standalone APIs
  - Angular Material or Tailwind CSS for enterprise UI
  - NgRx for global state management
  - RxJS for async streams
  - JSON Schema / custom metadata for form definitions
  - Storybook for reusable component development
- Backend
  - Quarkus with Maven multi-module layout
  - Java 21+ with Jakarta EE / RESTEasy reactive
  - PostgreSQL for relational persistence
  - Keycloak / OAuth2 for auth integration
  - Liquibase/Flyway for DB migrations
- DevOps
  - Docker + Docker Compose
  - GitHub Actions / GitLab CI for pipeline
  - Local dev using `docker-compose`, IDE run configurations, and VS Code Remote Containers

## Docker & Dev Environment

- `docker-compose.yml`: compose services for `frontend`, `auth-service`, `form-service`, `workflow-service`, `postgres`, and optionally `keycloak`.
- Use service-specific `Dockerfile.*` under `backend/docker/`.
- Local dev strategy:
  - `npm install` and `ng serve --open` for frontend
  - `mvn quarkus:dev` for each backend service
  - `docker-compose up` for integration-ready environment

## Suggested Implementation Order

1. Establish monorepo foundations: root `frontend/` and `backend/` with parent configs.
2. Build `core` and `shared` Angular layer; set up routing, HTTP interceptors, and auth guard skeletons.
3. Implement `auth-service` and `auth` frontend flows first for secure access.
4. Add `form-service` backend and `dynamic-form-renderer` frontend to manage schema storage and rendering.
5. Build `form-builder` feature with drag-and-drop metadata editor and save-to-backend capability.
6. Add `workflow-service` backend and `workflow-engine` frontend for designing/executing workflows.
7. Introduce NgRx gradually for `auth`, `form-builder`, and `workflow-engine` state.
8. Harden with tests, API contracts, and Docker-based local integration.

## Initial Modules to Build First

- Frontend: `core`, `auth`, `dynamic-form-renderer`, `shared`, `dashboard`
- Backend: `common`, `auth-service`, `form-service`
- Cross-cutting: API contract, DB model, and environment configuration.

## Enterprise Best Practices

- Keep features self-contained and lazy-loaded.
- Prefer domain-driven folders over flat structure.
- Keep `shared` lean: only UI primitives and utilities, not business logic.
- Use typed HTTP clients and DTOs across frontend/backend boundaries.
- Keep `core` for app-wide infrastructure, not feature-level code.
- Maintain a single source of truth for JSON schema versions.
- Use a parent Maven aggregator to enable service-level builds and shared artifacts.
- Build small bounded contexts: `auth`, `form`, `workflow` each own their data and APIs.
- Add API versioning from the start and contract tests between frontend and backend.
- Practice incremental evolution: start with monorepo services, then split into independent microservices when needed.
