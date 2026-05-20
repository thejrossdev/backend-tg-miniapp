import { GI18nService } from '@/common/services';
import { Global, Module } from '@nestjs/common';

/**
 * Module for translation.
 */
// Make the module global so that we don't have
// to import it into every other module that needs it.
@Global()
@Module({
	providers: [GI18nService],
	exports: [GI18nService],
})
export class GI18nModule {}
