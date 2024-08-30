import { relationsFromExpansions } from './index';

describe('relationsFromExpansions', () => {
  it('should handle a single relation without nesting', () => {
    const expansions = ['posts'];
    const include = relationsFromExpansions(expansions);
    expect(include).toEqual({ posts: true });
  });

  it('should handle a single expansion with 1 level of nesting', () => {
    const expansions = ['posts.categories'];
    const include = relationsFromExpansions(expansions);
    expect(include).toEqual({ posts: { categories: true } });
  });

  it('should handle multiple expansions with mixed nesting', () => {
    const expansions = ['posts.categories', 'photos'];
    const include = relationsFromExpansions(expansions);
    expect(include).toEqual({
      posts: { categories: true },
      photos: true,
    });
  });

  it('should handle expansions with overlapping paths', () => {
    const expansions = ['posts', 'posts.categories', 'photos'];
    const include = relationsFromExpansions(expansions);
    expect(include).toEqual({
      posts: { categories: true },
      photos: true,
    });
  });

  it('should handle deep nesting with multiple overlapping paths', () => {
    const expansions = ['users', 'users.posts', 'users.posts.categories'];
    const include = relationsFromExpansions(expansions);
    expect(include).toEqual({
      users: {
        posts: { categories: true },
      },
    });
  });
});
