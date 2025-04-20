#!/usr/bin/env node

import {Command} from 'commander'

import packageJson from '@/package.json' with {type: 'json'}

import {addCommand} from '@/src/commands/add/command'
import {initCommand} from '@/src/commands/init/command'
import {modelCommand} from '@/src/commands/model/command'
import {newCommand} from '@/src/commands/new/command'

process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

async function main() {
	const program = new Command()
		.name('wunshot')
		.version(
			packageJson.version ?? '0.0.1',
			'-v, --version',
			'display the version number',
		)
		.addCommand(addCommand)
		.addCommand(initCommand, {isDefault: true})
		.addCommand(modelCommand)
		.addCommand(newCommand)

	program.parse()
}

main()
