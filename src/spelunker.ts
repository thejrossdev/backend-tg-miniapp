import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { SpelunkerModule } from 'nestjs-spelunker';
import * as fs from 'node:fs';
import { join } from 'path';

/**
 * Visualize project dependencies and how to properly structure dependencies,
 * ensuring they propagate strictly from top to bottom, avoiding horizontal and circular dependencies
 *
 * @param {NestFastifyApplication} app - The NestJS Fastify application instance.
 * @returns {Promise<void>} A promise that resolves when spelunker is set up.
 */
export const spelunker = async (app: NestFastifyApplication): Promise<void> => {
	const tree = SpelunkerModule.explore(app);
	const root = SpelunkerModule.graph(tree);
	const edges = SpelunkerModule.findGraphEdges(root);
	const mermaidEdges = edges
		.map(({ from, to }) => `  ${from.module.name}-->${to.module.name}`)
		// filter out modules from the chart if you need
		// .filter((edge) => !edge.includes('FilteredModule') && !edge.includes('OtherExample'))
		.sort();

	fs.writeFileSync(
		join(__dirname, '..', 'docs/assets', 'deps.mermaid'),
		`graph LR
		${mermaidEdges.join('\n')}`,
	);
};
