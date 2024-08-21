import { BadRequestException } from '@nestjs/common';

export class InvalidExpansionException extends BadRequestException {
  constructor(
    public readonly expansion: string,
    public readonly availableExpansions: string[]
  ) {
    const available = availableExpansions.join(', ');
    super(
      `Invalid expansion "${expansion}" specified. The available options are: ${available}`
    );
  }
}
