# Multi-Tenant Scope-Based-Access-Control (SBAC) on RedwoodJS Proof-of-Concept

Welcome to the Multi-Tenant Scope-Based-Access-Control on RedwoodJS Proof-of-Concept repository!

This repository demonstrates a proof-of-concept implementation of SBAC using custom directives `@requireOrg` and `@requireScope` in RedwoodJS. The directives check user memberships and role scopes at a field-level on top of GraphQL SDLs.

## Prerequisites

- Redwood requires [Node.js](https://nodejs.org/en/) (>=18.x) and [Yarn](https://yarnpkg.com/) (>=1.15)

## Getting Started

To get started with the repository, clone it and install the dependencies:

```bash
git clone https://github.com/xmaxcooking/redwood-sbac.git
cd your_repository
yarn install
```

After the installation process, migrate the database and start the development server:

```bash
yarn rw prisma migrate dev
yarn rw dev
```

Your server should now be running at http://localhost:8910.

## The `model` in detail

Features:
- A user can be a member of many organizations
- A member of an organization has a role
- A role has many scopes
- Posts are created for an organization

Notes:
- When using with a postresql provider the scope names would be enums. this is written for sqlite for the purpose of demonstration.

```prisma
model User {
  id                  Int          @id @default(autoincrement())
  email               String       @unique
  name                String?
  hashedPassword      String
  salt                String
  resetToken          String?
  resetTokenExpiresAt DateTime?
  Memberships         Membership[]
}

model Membership {
  id             Int          @id @default(autoincrement())
  user           User         @relation(fields: [userId], references: [id])
  userId         Int
  Organization   Organization @relation(fields: [organizationId], references: [id])
  organizationId Int
  Role           Role         @relation(fields: [roleId], references: [id])
  roleId         Int

  @@index([userId])
  @@index([organizationId])
  @@index([roleId])
}

model Organization {
  id      Int          @id @default(autoincrement())
  name    String
  Members Membership[]
  Posts   Post[]
}

model Role {
  id          Int          @id @default(autoincrement())
  name        String
  Memberships Membership[]
  Scopes      RoleScope[]
}

model RoleScope {
  id      Int   @id @default(autoincrement())
  Role    Role  @relation(fields: [roleId], references: [id])
  roleId  Int
  Scope   Scope @relation(fields: [scopeId], references: [id])
  scopeId Int

  @@index([roleId])
  @@index([scopeId])
}

model Scope {
  id    Int         @id @default(autoincrement())
  name  String
  Roles RoleScope[]
}

model Post {
  id             Int          @id @default(autoincrement())
  title          String
  body           String
  Organization   Organization @relation(fields: [organizationId], references: [id])
  organizationId Int

  @@index([organizationId])
}
```

## The `getCurrentUser`

The getCurrentUser function in `src/lib/auth` has to be updated to reflect the users memberships and scopes.
This is to minimize the additional overhead by membership or scope validations and the eventually necessary selective enabling/disabling on the web side.

```typescript
export const getCurrentUser = async (session: Decoded) => {
  if (!session || typeof session.id !== 'number') {
    throw new Error('Invalid session')
  }

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      Memberships: {
        select: {
          Organization: {
            select: {
              id: true,
            },
          },
          Role: {
            select: {
              Scopes: {
                select: {
                  Scope: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  return user
}
```

## The `@requireOrg` Directive

The `@requireOrg` directive is utilized in our GraphQL schema definitions for operations which require the user to be a member of an organization (without any scope requirements)

Here's how it's being used in context:

```graphql
  type Query {
    posts(orgId: Int!): [Post!]! @requireOrg(input: "orgId")
    ...
  }
```

## The `@requireOrg` Directive in Detail

The @requireOrg directive, as used in the above context, takes one argument.

- input: Specifies the context variable which should be used as the organization id for the validator

This directive is validated by a function in the background which checks the currentUser for a corresponding membership entry for. Here is a brief illustration of the validation function:

```typescript
import { requireOrg as applicationRequireOrg } from 'src/lib/org'

const validate: ValidatorDirectiveFunc = ({ context, directiveArgs }) => {
  const id = Number(context.params['variables'][directiveArgs.input])
  applicationRequireOrg({ id })
}
```

```typescript
import { ForbiddenError } from '@redwoodjs/graphql-server'

export const hasOrg = (orgId: number) => {
  if (!context.currentUser) return false
  if (!context.currentUser.Memberships) return false
  return context.currentUser.Memberships.find(
    (m) => m.Organization.id === orgId
  )
}

export const requireOrg = ({ id }: { id: number }) => {
  if (id && !hasOrg(id)) {
    throw new ForbiddenError("You don't have access to this Organization.")
  }
}
```

## The `@requireScope` Directive

The `@requireScope` directive is utilized in our GraphQL schema definitions for operations which require the user to be a member of an organization and assigned with a role that contains the necessary scopes.

Here's how it's being used in context:

```graphql
  type Mutation {
    createPost(orgId: Int!, input: CreatePostInput!): Post!
      @requireScope(input: "orgId", scope: "create:post")
    updatePost(postId: Int!, orgId: Int!, input: UpdatePostInput!): Post!
      @requireScope(input: "orgId", scope: "update:post")
    deletePost(postId: Int!, orgId: Int!): Post!
      @requireScope(input: "orgId", scope: "delete:post")
  }
```

Instead of the usual:

```graphql
  type Mutation {
    createPost(input: CreatePostInput!): Post! @requireAuth
    updatePost(postId: Int!, input: UpdatePostInput!): Post! @requireAuth
    deletePost(postId: Int!): Post! @requireAuth
  }
```

### WARNING:
Validation of CRUD Operations involving scopes require the organization id always to be passed to the graphql mutations
if you don't want the overhead of any additional database queries.

## The `@requireScope` Directive in Detail

The @requireScope directive, as used in the above context, takes two arguments.

- input: Specifies the context variable which should be used as the organization id for the validator
- scope: The necessary scope of the membership role


```typescript
import { requireScope as applicationRequireScope } from 'src/lib/scope'

const validate: ValidatorDirectiveFunc = ({ context, directiveArgs }) => {
  const { input, scope } = directiveArgs
  const orgId = Number(context.params['variables'][input])
  applicationRequireScope({ orgId, scope })
}
```

```typescript
import { ForbiddenError } from '@redwoodjs/graphql-server'

export const hasScope = (orgId: number, scope: string) => {
  if (!context.currentUser) return false
  if (!context.currentUser.Memberships) return false
  return context.currentUser.Memberships.find(
    (m) =>
      m.Organization.id === orgId &&
      m.Role.Scopes.find((s) => s.Scope.name === scope)
  )
}

export const requireScope = ({
  orgId,
  scope,
}: {
  orgId: number
  scope: string
}) => {
  if (orgId && scope && !hasScope(orgId, scope)) {
    throw new ForbiddenError("You don't have access to this Resource.")
  }
}

```

## Feedback and Contributions
This repository is a proof-of-concept and is open to suggestions and contributions. Feel free to share your thoughts or make a pull request.
