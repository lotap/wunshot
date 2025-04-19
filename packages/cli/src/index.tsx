#!/usr/bin/env node

import {apex} from '@/src/commands/apex/command'
import {hello} from '@/src/commands/hello/command'

process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

async function main() {
	const program = apex

	program.addCommand(hello)

	program.parse()
}

main()
