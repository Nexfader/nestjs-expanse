type TypeOrmRelationObject = {
  [key: string]: true | TypeOrmRelationObject;
};

/**
 * Converts an expansion array to TypeORM `relations` object
 *
 * @param {string[]} expansions - The expansion array
 * @returns {Object} The object that can be passed to the `relations`
 * property in TypeORM queries
 *
 * @example
 * // returns { photos: true, posts: { categories: true } }
 * relationsFromExpansions(['photos', 'posts.categories'])
 */
export function relationsFromExpansions(
  expansions: string[]
): TypeOrmRelationObject {
  const relations: TypeOrmRelationObject = {};

  for (const expansion of expansions) {
    const parts = expansion.split('.');
    let current = relations;

    for (const [index, part] of parts.entries()) {
      if (index === parts.length - 1) current[part] = true;
      else {
        if (!current[part] || current[part] === true) current[part] = {};
        current = current[part] as TypeOrmRelationObject;
      }
    }
  }

  return relations;
}
