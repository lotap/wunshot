import React from 'react'

import {Command} from 'commander'
import {render} from 'ink'

import {SecretAction} from './action'

export const secretCommand = new Command()
	.name('secret')
	.alias('secrets')
	.description('generate a secret pair for your tokens')
	.option(
		'-c, --count <number>',
		'number of pairs to generate (default: 3)',
		'3',
	)
	.action(({count}) => {
		render(<SecretAction count={count} />)
	})
