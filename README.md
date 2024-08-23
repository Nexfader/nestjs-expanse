# 🌌 NestJS-Expanse

[![NPM package](https://img.shields.io/npm/v/nestjs-expanse.svg)](https://www.npmjs.org/package/nestjs-expanse)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A NestJS module that enables REST API consumers to expand related resources in the payload, similar to GraphQL.

## Motivation

Consider a REST API endpoint `/users/1` that returns a user:

```json
{
  "id": 1,
  "name": "Josephus Miller",
  "posts": [{
    "id": 1,
    "title": "Review of my new hat",
    "categories": [{
      "id": 1,
      "name": "Life"
    }]
  }],
  "photos": [{
    "id": 1,
    "url": "/avatar.jpg"
  }]
}
```

Note that the response body will always include `posts` and `photos` fields, and each post will contain `categories`, which might not be necessary for every API consumer use case. While this approach will work well for small projects, as the API grows, you may start noticing performance issues because there is no way to conditionally load or unload related entities.

At this moment, you might think of GraphQL. Although it's a powerful technology, it might not be suitable for every use case due to its complexity. Many large API providers have opted not using GraphQL, instead implementing an expansion system on top of REST (e.g. X and Atlassian). This library aims to solve the problem in a similar way.

To get the same payload as mentioned above, the API consumer can now call the endpoint as follows: `/users/1?expand=posts.categories,photos` (or `/users/1?expand[]=posts.categories&expand[]=photos`).

## Quick Guide

### Installation

```bash
npm install nestjs-expanse --save
```

### Entity Decorators

As you decorate your relations with `Expandable`, NestJS-Expanse will be able to detect all the available expansions (including the deep ones).

```typescript
import { Expandable } from 'nestjs-expanse';

export class UserEntity {
  id!: number;
  name!: string;

  @Expandable(() => PostEntity)
  posts?: PostEntity[];
}
```

### Obtaining Requested Expansions

```typescript
import { Expansions } from 'nestjs-expanse';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('current')
  async findCurrent(
    @Expansions(UserEntity) expansions: string[],
  ) {
    // Do whatever you want with `expansions`. Pass it to a service for example:
    this.userService.findCurrent(expansions);
  }
}
```

### Behavior On Error

NestJS-Expanse throws an `InvalidExpansionException` if any of the requested expansions are unavailable. This exception class extends BadRequestException and provides a sensible default message, resulting in an HTTP 400 response with a human-readable error by default, which should suffice for most cases. However, you can handle the exception yourself using Nest's [exception filters](https://docs.nestjs.com/exception-filters)

## ORM Integration

One of the library's features is its integration with ORMs, minimizing the need for boilerplate code.

### Prisma

```typescript
import { includeFromExpansions } from 'nestjs-expanse/prisma';

class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(expansions: string[]) {
    return this.prismaService.user.findMany({
      include: includeFromExpansions(expansions),
    });
  }
}
```
