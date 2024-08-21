import { type CanActivate } from '@nestjs/common';

export type ExpandableDecoratorOptions = {
  guards?: CanActivate[];
};
export type ExpandableMetadata = {
  propertyKey: string;
  type: () => Function;
  options: ExpandableDecoratorOptions;
};

export const EXPANDABLE_METADATA_KEY = 'custom:expandable';

export function Expandable(
  type: () => Function,
  options: ExpandableDecoratorOptions = {}
) {
  return function (target: Object, propertyKey: string) {
    const metadata = Reflect.getMetadata(EXPANDABLE_METADATA_KEY, target) ?? [];
    metadata.push({ propertyKey, type, options });
    Reflect.defineMetadata(EXPANDABLE_METADATA_KEY, metadata, target);
  };
}
