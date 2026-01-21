# Saldofy — Personal & Business Finance Management Platform

## Overview
**Saldofy** is a modern web application designed to manage personal and small business finances in a simple, structured, and efficient way. Built as a **multi-tenant SaaS**, the platform focuses on usability, scalability, and clean architecture.

It enables individuals, freelancers, and small businesses to track income and expenses with clarity, without the complexity of traditional accounting systems.

---

## Problem Statement
Many individuals and small businesses still manage their finances using spreadsheets, scattered notes, or generic tools not designed for financial workflows. This commonly leads to:

- Loss of financial visibility  
- Difficulty tracking income and expenses over time  
- Poor organization of personal and business finances  
- Higher risk of errors and inconsistent data  

These limitations make financial decision-making harder and increase operational risk.

---

## Solution
Saldofy addresses these issues by providing:

- A **centralized financial management system**  
- Clear separation between personal and business financial data  
- Structured income and expense tracking  
- Strong user-level data isolation in a multi-tenant environment  
- A modern, responsive user interface  

The platform prioritizes clarity, security, and long-term scalability.

---

## System Goals
- Centralize personal and business financial data  
- Simplify income and expense tracking  
- Improve financial organization and visibility  
- Ensure secure, user-isolated data access  
- Deliver a clean, fast, and responsive interface  
- Support growth as a scalable multi-tenant SaaS  

---

## Key Features
- User authentication  
- Multi-tenant architecture  
- Personal and business finance management  
- Income tracking  
- Expense tracking  
- Financial categorization  
- Secure user data isolation  
- Basic access control  
- Responsive interface (desktop and mobile)  

---

## Architecture Overview
Saldofy is built using **Next.js**, unifying frontend and backend logic into a single, cohesive architecture.

- **Frontend:** React-based interface rendered with Next.js  
- **Backend:** Server-side logic implemented in TypeScript  
- **Authentication:** Enforced across the entire application  
- **Authorization:** All data access strictly scoped to the authenticated user  
- **Database:** PostgreSQL accessed via Prisma ORM  

All validation, authorization, and business rules are applied before any database interaction, ensuring data consistency and security.

The system is designed as a **multi-tenant SaaS**, where each user operates in a fully isolated data context.

---

## Technical Decisions and Trade-offs

### Why Next.js?
- Enables a single codebase for frontend and backend  
- Simplifies routing, deployment, and environment management  
- Supports modern React patterns and server-side logic  

**Trade-off:** Reduced architectural separation compared to microservices, accepted to minimize complexity at the current scale.

---

### Why Prisma and PostgreSQL?
- Strong typing and schema safety  
- Controlled migrations and predictable schema evolution  
- Reliable relational data modeling  

**Trade-off:** ORM abstraction overhead compared to raw SQL, accepted for maintainability and correctness.

---

### Why Multi-Tenant Architecture?
- Efficient resource usage  
- Simplified onboarding and scalability  
- Centralized platform management  

**Trade-off:** Increased complexity in authorization and data isolation, mitigated through strict user scoping at the backend level.

---

### Why Docker?
- Consistent environments across development and deployment  
- Reduced configuration drift  

**Trade-off:** Slightly higher initial setup complexity, justified by long-term stability.

---

## Data Model Overview
- **Users:** Represent individual tenants within the system  
- **Financial Records:**  
  - Income entries  
  - Expense entries  
  - Categorized for organization and reporting  

All records are strictly associated with a single user to guarantee isolation in the multi-tenant model.

---

## Security Considerations
- Mandatory authentication for all routes  
- Strict user-based data isolation  
- Backend-enforced authorization checks  
- Validation at API boundaries to prevent invalid data persistence  

---

## Testing Strategy
The project prioritizes correctness and data integrity through:

- Backend validation and authorization checks  
- Controlled data access via Prisma  
- Isolated environments for development and testing  

Automated test coverage can be expanded as the platform evolves.

---

## Roadmap
- Financial reports and dashboards  
- Monthly and yearly summaries  
- Export data (CSV / PDF)  
- Role-based access control  
- Budget planning and alerts  

---

## License
This project is licensed under the MIT License.
