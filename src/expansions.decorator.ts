import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import {
  EXPANDABLE_METADATA_KEY,
  type ExpandableMetadata,
} from './expandable.decorator';
import { InvalidExpansionException } from './invalid-expansion.exception';

type QueryParamsRecord = Record<string, string | string[]>;
// Both express and fastify requests should be compliant with this type
type RequestWithQueryParams = {
  query: QueryParamsRecord;
};

export const Expansions = createParamDecorator(
  (data: Function, ctx: ExecutionContext) => {
    const query = ctx.switchToHttp().getRequest<RequestWithQueryParams>().query;
    const expansions = extractExpansionsFromQueryParams(query);
    const availableExpansions = collectExpansionsRecursive(ctx, data);

    for (const expansion of expansions)
      if (!availableExpansions.includes(expansion))
        throw new InvalidExpansionException(expansion, availableExpansions);

    return expansions;
  }
);

const EXPAND_QUERY_PARAM_NAME = 'expand'; // TODO: make configurable

function extractExpansionsFromQueryParams(query: QueryParamsRecord) {
  const propertyKeys = [
    EXPAND_QUERY_PARAM_NAME,
    `${EXPAND_QUERY_PARAM_NAME}[]`,
  ];
  for (const key of propertyKeys) {
    const property = query[key];
    if (property) return Array.isArray(property) ? property : [property];
  }

  return [];
}

function collectExpansionsRecursive(
  ctx: ExecutionContext,
  entity: Function,
  visited: Set<Function> = new Set()
): string[] {
  if (!entity || visited.has(entity)) return [];

  visited.add(entity);

  const metadata: ExpandableMetadata[] =
    Reflect.getMetadata(EXPANDABLE_METADATA_KEY, entity.prototype) ?? [];
  const expansions: string[] = [];

  for (const { propertyKey, type, options } of metadata) {
    // TODO: collect unique guards and execute only once
    if (!canActivate(ctx, options.guards ?? [])) continue;

    expansions.push(propertyKey);

    const propertyType = type();
    if (propertyType && typeof propertyType === 'function') {
      const nestedExpandableProperties = collectExpansionsRecursive(
        ctx,
        propertyType,
        visited
      );

      expansions.push(
        ...nestedExpandableProperties.map(
          (nestedProperty) => `${propertyKey}.${nestedProperty}`
        )
      );
    }
  }

  return expansions;
}

function canActivate(ctx: ExecutionContext, guards: CanActivate[]) {
  for (const guard of guards) if (!guard.canActivate(ctx)) return false;
  return true;
}
