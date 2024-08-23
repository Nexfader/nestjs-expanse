type PrismaIncludeObject = { [key: string]: true | PrismaIncludeObject };

/**
 * Converts an expansion array to Prisma ORM include object
 *
 * @param {string[]} expansions - The expansion array
 * @returns {Object} The object that can be passed to the include
 * property in Prisma queries
 *
 * @example
 * // returns { photos: true, posts: { include: { categories: true } } }
 * includeFromExpansions(['photos', 'posts.categories'])
 */
export function includeFromExpansions(
  expansions: string[]
): PrismaIncludeObject {
  const include: PrismaIncludeObject = {};

  for (const expansion of expansions) {
    const parts = expansion.split('.');
    let current = include;

    for (const [index, part] of parts.entries()) {
      if (index === parts.length - 1) current[part] = true;
      else {
        if (!current[part] || current[part] === true)
          current[part] = { include: {} };
        current = (current[part] as PrismaIncludeObject)
          .include as PrismaIncludeObject;
      }
    }
  }

  return include;
}
